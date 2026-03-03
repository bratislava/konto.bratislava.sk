import { Injectable } from '@nestjs/common'
import { PhysicalEntity, QueueItemStatusEnum } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PhysicalEntityService } from '../physical-entity/physical-entity.service'
import { CreateManyParam, NasesService } from '../nases/nases.service'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import dayjs from 'dayjs'
import { toLogfmt } from '../utils/logging'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { MagproxyErrorsEnum } from '../magproxy/magproxy.errors.enum'
import { parseName } from '../magproxy/dtos/uri'

@Injectable()
export class UpvsQueueService {
  private readonly logger: LineLoggerSubservice

  private readonly CACHE_TTL_HOURS = 96 // Configurable cache TTL

  private readonly BATCH_SIZE = 8 // 8 requests per batch

  private readonly HIGH_PRIORITY_RESERVED_SLOTS = 6 // Reserve 6 slots for high priority

  constructor(
    private readonly prismaService: PrismaService,
    private readonly physicalEntityService: PhysicalEntityService,
    private readonly nasesService: NasesService,
    private readonly cognitoSubservice: CognitoSubservice,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(UpvsQueueService.name)
  }

  async addExternalItemsToQueue(records: {uri: string, externalId: string}[]) {
    await this.prismaService.externalEdeskCheck.createMany({
      data: records.map((record) => ({ uri: record.uri, externalId: record.externalId })),
    })
  }

  async getNumberOfExternalItemsInQueue(): Promise<number> {
    return this.prismaService.externalEdeskCheck.count({
      where: {
        queueStatus: QueueItemStatusEnum.PENDING,
      },
    })
  }

  async retrieveFinishedExternalItems(limit: number) {
    const result = await this.prismaService.externalEdeskCheck.findMany({
      where: {
        OR: [
          { queueStatus: QueueItemStatusEnum.COMPLETED },
          { queueStatus: QueueItemStatusEnum.FAILED },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    })

    return result
  }

  /**
   * Process one batch of queue items according to priority rules
   * Returns the number of items processed from each queue
   */
  async processBatch(): Promise<void> {
    const result = {
      message: 'Upvs queue report.',
      urgentProcessed: 0,
      highPriorityProcessed: 0,
      externalProcessed: 0,
      totalProcessed: 0,
      errors: [] as string[],
    }

    try {
      let remainingSlots = this.BATCH_SIZE

      // Get all urgent items (up to capacity)
      const urgentItems = await this.getUrgentQueueItems(remainingSlots)
      remainingSlots = remainingSlots - urgentItems.length

      // Get high priority items (up to reservation)
      const highPrioritySlots = Math.min(this.HIGH_PRIORITY_RESERVED_SLOTS, remainingSlots)
      const highPriorityItems = await this.getHighPriorityQueueItems(highPrioritySlots)

      // If high priority doesn't fill reservation, give to external queue
      remainingSlots = remainingSlots - highPriorityItems.length
      const externalItems = await this.getExternalQueueItems(remainingSlots)

      const createManyJoinedInput: CreateManyParam = [
        ...urgentItems,
        ...highPriorityItems,
        ...externalItems,
      ]

      if (createManyJoinedInput.length === 0) {
        this.logger.log(result)
        return
      }

      const upvsResult = await this.nasesService.createMany(createManyJoinedInput)

      // success: separate urgent and high priority from external
      const externalUris = new Set(externalItems.map((item) => item.uri))
      const successInternal = upvsResult.success.filter((item) => item.physicalEntityId !== null)
      const successExternal = upvsResult.success.filter((item) => externalUris.has(item.uri))

      // handle success
      await this.physicalEntityService.updateSuccessfulActiveEdeskUpdateInDatabase(successInternal)

      // handle success external
      await Promise.all(
        successExternal.map(async (item) => {
          await this.prismaService.externalEdeskCheck.updateMany({
            where: { uri: item.uri },
            data: {
              queueStatus: QueueItemStatusEnum.COMPLETED,
              upvsStatus: item.data.status ?? null,
              edeskStatus: item.data.upvs?.edesk_status ?? null,
              edeskNumber: item.data.upvs?.edesk_number ?? null,
              processedAt: new Date(),
            },
          })
        })
      )

      // handle failures both internal and external
      const failedInternalIds = upvsResult.failed
        .filter((item) => item.physicalEntityId)
        .map((item) => item.physicalEntityId!)

      if (failedInternalIds.length > 0) {
        await this.physicalEntityService.updateFailedActiveEdeskUpdateInDatabase(failedInternalIds)
      }

      const failedExternalUris = upvsResult.failed
        .filter((item) => !item.physicalEntityId && externalUris.has(item.uri))
        .map((item) => item.uri)

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

      // update result counters
      result.urgentProcessed = urgentItems.length
      result.highPriorityProcessed = highPriorityItems.length
      result.externalProcessed = externalItems.length
      result.totalProcessed = createManyJoinedInput.length
    } catch (error) {
      this.logger.error('Error processing batch', error)
      result.errors.push('\n\n'.concat(toLogfmt(error)))
    }

    this.logger.log(result)
    return
  }

  /**
   * Parse URI name from Cognito given_name and family_name
   * Similar to parseUriNameFromRfo but uses Cognito attributes
   */
  private parseUriNameFromCognito(
    givenName: string | undefined,
    familyName: string | undefined
  ): string | null {
    if (!givenName || !familyName) {
      return null
    }

    const processedFamilyName = parseName(familyName)
    const processedGivenName = parseName(givenName)

    return `${processedFamilyName}_${processedGivenName}`
  }

  /**
   * Get urgent queue items: PhysicalEntities with birthNumber but no uri
   */
  private async getUrgentQueueItems(limit: number): Promise<CreateManyParam> {
    const entities = await this.prismaService.$queryRaw<
      (PhysicalEntity & { externalId: string })[]
    >`
      SELECT e.*, u."externalId" as externalId
      FROM "PhysicalEntity" e
      JOIN "User" u ON e."userId" = u."id"
      WHERE e."birthNumber" IS NOT NULL
        AND e."uri" IS NULL
        AND u."birthNumber" IS NOT NULL
      ORDER BY greatest(e."createdAt", e."activeEdeskUpdateFailedAt") NULLS FIRST
      LIMIT ${limit}
    `

    const preparedItems = await this.prepareUrgentItems(entities)
    return preparedItems
  }

  /**
   * Get high priority queue items: PhysicalEntities with uri that need Edesk status update
   * Filters out entities with fresh cache and respects exponential backoff
   */
  private async getHighPriorityQueueItems(limit: number): Promise<CreateManyParam> {
    const lookBackDate = dayjs().subtract(this.CACHE_TTL_HOURS, 'hour')

    // Reuse existing edesk-tasks query logic with exponential backoff
    const entities = await this.prismaService.$queryRaw<PhysicalEntity[]>`
      SELECT e.*
      FROM "PhysicalEntity" e
      WHERE "userId" IS NOT NULL
        AND "uri" IS NOT NULL
        AND ("activeEdeskUpdatedAt" IS NULL OR "activeEdeskUpdatedAt" < ${lookBackDate.toDate()})
        AND ("activeEdeskUpdateFailedAt" IS NULL OR
             "activeEdeskUpdateFailCount" = 0 OR
             ("activeEdeskUpdateFailedAt" + (POWER(2, least("activeEdeskUpdateFailCount", 7)) * INTERVAL '1 hour') < ${lookBackDate.toDate()}))
      ORDER BY greatest("createdAt", "activeEdeskUpdatedAt", "activeEdeskUpdateFailedAt") NULLS FIRST
      LIMIT ${limit}
    `

    return entities.map((entity) => {
      return { physicalEntityId: entity.id, uri: entity.uri! }
    })
  }

  /**
   * Get external queue items: External URIs that need processing
   */
  private async getExternalQueueItems(limit: number): Promise<CreateManyParam> {
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

  /**
   * Process urgent queue item: Get UPVS identity (uri) for PhysicalEntity with birthNumber
   * Uses Cognito given_name and family_name to construct URI
   */
  private async prepareUrgentItems(
    entities: (PhysicalEntity & { externalId: string })[]
  ): Promise<CreateManyParam> {
    const idBirthNumberUserIdList = entities
      .map((entity) => {
        return { id: entity.id, birthNumber: entity.birthNumber, externalId: entity.externalId }
      })
      .filter(
        (entity): entity is { id: string; birthNumber: string; externalId: string } =>
          entity.birthNumber !== null && entity.externalId !== null
      )

    const idUriList = await Promise.allSettled(
      idBirthNumberUserIdList.map(async (item) => {
        // Get user data from Cognito
        const cognitoUser = await this.cognitoSubservice.getDataFromCognito(item.externalId)

        // Parse URI name from Cognito given_name and family_name
        const uriName = this.parseUriNameFromCognito(
          cognitoUser.given_name,
          cognitoUser.family_name
        )

        if (!uriName) {
          throw this.throwerErrorGuard.InternalServerErrorException(
            MagproxyErrorsEnum.BIRTH_NUMBER_NOT_EXISTS,
            'Missing given_name or family_name in Cognito user data',
            toLogfmt({ externalId: item.externalId, entityId: item.id })
          )
        }

        const processedBirthNumber = item.birthNumber.replaceAll('/', '')
        const uri = `rc://sk/${processedBirthNumber}_${uriName}`
        this.logger.log(`Trying to verify the following uri for entityId ${item.id}: ${uri}`)

        return { uri, physicalEntityId: item.id }
      })
    )

    // log errors if any occurred
    let errorMessage: string = ''
    idUriList
      .filter((item) => item.status === 'rejected')
      .forEach((item) => {
        errorMessage = [errorMessage, toLogfmt(item.reason)].join('\\n\\n')
      })

    if (errorMessage) {
      this.logger.error(`Failed to process entities in urgent queue: ${errorMessage}`)
    }

    const successfulIdUriPairs = idUriList
      .filter((item) => item.status === 'fulfilled')
      .map((item) => item.value)

    return successfulIdUriPairs
  }
}
