import { Injectable } from '@nestjs/common'
import { QueueItemStatusEnum } from '@prisma/client'
import dayjs from 'dayjs'

import {
  GetIdentitiesByUrisResult,
  getUpvsDeathDate,
  GetUpvsIdentitiesByUrisParam,
  NasesService,
} from '../nases/nases.service'
import { PhysicalEntityService } from '../physical-entity/physical-entity.service'
import { PrismaService } from '../prisma/prisma.service'
import { toLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { selectHighPriorityEntities } from './upvs-queue.queries'

@Injectable()
export class EdeskBatchUpdateService {
  private readonly logger = new LineLoggerSubservice(EdeskBatchUpdateService.name)

  private readonly CACHE_TTL_HOURS = 144 // Configurable cache TTL

  private readonly BATCH_SIZE = 8 // 8 requests per batch for the URI-search flow

  private readonly HIGH_PRIORITY_RESERVED_SLOTS = 5 // Reserve 5 slots for high priority

  constructor(
    private readonly prismaService: PrismaService,
    private readonly physicalEntityService: PhysicalEntityService,
    private readonly nasesService: NasesService
  ) {}

  /**
   * Run one batched URI-search tick: split the BATCH_SIZE budget between high-priority
   * internal entities and pending external items, resolve them all via a single
   * `getIdentitiesByUris` search, and persist the outcomes.
   *
   * @returns counts the orchestrator folds into its batch report.
   */
  async updateEdeskStatusBatch(): Promise<{
    highPriorityProcessed: number
    externalProcessed: number
  }> {
    let remainingSlots = this.BATCH_SIZE
    const highPrioritySlots = Math.min(this.HIGH_PRIORITY_RESERVED_SLOTS, remainingSlots)
    const highPriorityItems = await this.getHighPriorityQueueItems(highPrioritySlots)
    remainingSlots -= highPriorityItems.length
    const externalItems = await this.getExternalQueueItems(remainingSlots)

    const getIdentitiesByUrisInput: GetUpvsIdentitiesByUrisParam = [
      ...highPriorityItems,
      ...externalItems,
    ]

    if (getIdentitiesByUrisInput.length === 0) {
      return { highPriorityProcessed: 0, externalProcessed: 0 }
    }

    const upvsResult = await this.nasesService.getIdentitiesByUris(getIdentitiesByUrisInput)

    const externalUris = new Set(externalItems.map((item) => item.uri))
    await this.handleSuccessfulUpdates(upvsResult, externalUris)
    await this.handleFailureCases(upvsResult, externalUris)

    return {
      highPriorityProcessed: highPriorityItems.length,
      externalProcessed: externalItems.length,
    }
  }

  private async handleSuccessfulUpdates(
    upvsResult: GetIdentitiesByUrisResult,
    externalUris: Set<string>
  ) {
    // Success: separate urgent and high priority from external
    // Filters are not strict, because any potential overlap will not cause any issues
    const successInternal = upvsResult.success.filter((item) => !!item.physicalEntityId)
    const successExternal = upvsResult.success.filter((item) => externalUris.has(item.inputUri))

    // handle success
    await this.physicalEntityService.updateSuccessfulActiveEdeskUpdateInDatabase(successInternal)

    // handle success external
    await Promise.all(
      successExternal.map(async (item) => {
        const edeskDeathDate = getUpvsDeathDate(item.data)
        const updated = await this.prismaService.externalEdeskCheck.update({
          where: { uri: item.inputUri },
          data: {
            queueStatus: QueueItemStatusEnum.COMPLETED,
            upvsStatus: item.data.status ?? null,
            edeskStatus: item.data.upvs?.edesk_status ?? null,
            edeskNumber: item.data.upvs?.edesk_number ?? null,
            edeskDeathDate,
            processedAt: new Date(),
            newUri: item.inputUri !== item.data.uri ? item.data.uri : undefined,
          },
        })

        if (edeskDeathDate) {
          this.logger.log(
            toLogfmt({
              event: 'external_edesk_death_date',
              norisId: updated.norisId,
              edeskDeathDate,
            })
          )
        }
      })
    )
  }

  private async handleFailureCases(
    upvsResult: GetIdentitiesByUrisResult,
    externalUris: Set<string>
  ) {
    const failedWithPossibleUriChange = upvsResult.failed.filter((item) => item.possibleUriChange)
    const failed = upvsResult.failed.filter((item) => !item.possibleUriChange)

    // Requeue possible URI changes
    if (failedWithPossibleUriChange.length > 0) {
      await this.prismaService.externalEdeskCheck.updateMany({
        where: {
          uri: { in: failedWithPossibleUriChange.map((item) => item.inputUri) },
          queueStatus: QueueItemStatusEnum.PENDING,
        },
        data: {
          queueStatus: QueueItemStatusEnum.NEW_URI_CHECK_REQUIRED,
        },
      })
      await this.prismaService.physicalEntity.updateMany({
        where: {
          uri: { in: failedWithPossibleUriChange.map((item) => item.inputUri) },
        },
        data: {
          uriPossiblyOutdated: true,
        },
      })
    }

    // Handle regular failures
    const failedInternalIds = failed
      .filter((item) => item.physicalEntityId)
      .map((item) => item.physicalEntityId!)

    if (failedInternalIds.length > 0) {
      await this.physicalEntityService.updateFailedActiveEdeskUpdateInDatabase(failedInternalIds)
    }

    const failedExternalUris = failed
      .filter((item) => externalUris.has(item.inputUri))
      .map((item) => item.inputUri)

    if (failedExternalUris.length > 0) {
      await this.prismaService.externalEdeskCheck.updateMany({
        where: {
          uri: { in: failedExternalUris },
          queueStatus: QueueItemStatusEnum.PENDING,
        },
        data: {
          queueStatus: QueueItemStatusEnum.FAILED,
          failCount: { increment: 1 },
        },
      })
    }
  }

  /**
   * Get high priority queue items: PhysicalEntities with uri that need Edesk status update
   * Filters out entities with fresh cache and respects exponential backoff
   */
  private async getHighPriorityQueueItems(limit: number): Promise<GetUpvsIdentitiesByUrisParam> {
    const lookBackDate = dayjs().subtract(this.CACHE_TTL_HOURS, 'hour').toDate()
    const entities = await selectHighPriorityEntities(this.prismaService, lookBackDate, limit)

    return entities.map((entity) => {
      return { physicalEntityId: entity.id, uri: entity.uri }
    })
  }

  /**
   * Get external queue items: External URIs that need processing
   */
  private async getExternalQueueItems(limit: number): Promise<GetUpvsIdentitiesByUrisParam> {
    const externalItems = await this.prismaService.externalEdeskCheck.findMany({
      where: {
        queueStatus: QueueItemStatusEnum.PENDING,
        uri: { not: null },
      },
      orderBy: { updatedAt: 'asc' },
      take: limit,
      select: {
        uri: true,
      },
    })
    return externalItems as { uri: string }[]
  }
}
