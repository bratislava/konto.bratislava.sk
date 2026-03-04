import { Injectable } from '@nestjs/common'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { PrismaService } from '../../prisma/prisma.service'
import { UpvsQueueService } from '../../upvs-queue/upvs-queue.service'
import { NorisService } from '../../noris/noris.service'
import { EdeskStatus } from '../../noris/types/noris.types'
import { UpvsIdentityUpvsEdeskStatusEnum } from 'openapi-clients/slovensko-sk'
import { z } from 'zod'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ExternalEdeskCheck, QueueItemStatusEnum } from '@prisma/client'

const PHYSICAL_PERSONS_RETRIEVE_BATCH_SIZE = 4000
const LEGAL_PERSONS_RETRIEVE_BATCH_SIZE = 0 // TODO: add when upvs retrieval works for legal persons
const EXTERNAL_ITEMS_PROCESS_BATCH_SIZE = 500

@Injectable()
export class EdeskTasksSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly upvsQueueService: UpvsQueueService,
    private readonly norisService: NorisService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(EdeskTasksSubservice.name)
  }

  async updateEdesk(): Promise<void> {
    await this.upvsQueueService.processBatch()
  }

  async alertFailingEdeskUpdate(): Promise<void> {
    const entitiesFailedToUpdate = await this.prismaService.physicalEntity.findMany({
      where: { activeEdeskUpdateFailCount: { gte: 7 } },
      select: {
        id: true,
        birthNumber: true,
        activeEdeskUpdateFailCount: true,
      },
    })

    if (entitiesFailedToUpdate.length === 0) {
      return
    }

    this.logger.error('Entities that failed to update at least 7 times in a row: ', {
      entities: entitiesFailedToUpdate,
      alert: 1,
    })
  }

  private mapUpvsEdeskStatusToNorisType(status: string): EdeskStatus {
    const parsedStatus = z.enum(UpvsIdentityUpvsEdeskStatusEnum).safeParse(status)
    if (!parsedStatus.success) {
      throw new Error(`Invalid UPVS eDesk status: ${status}`)
    }
    switch (parsedStatus.data) {
      case UpvsIdentityUpvsEdeskStatusEnum.Nonexistent:
        return EdeskStatus.NONEXISTENT
      case UpvsIdentityUpvsEdeskStatusEnum.Created:
        return EdeskStatus.CREATED
      case UpvsIdentityUpvsEdeskStatusEnum.Active:
        return EdeskStatus.ACTIVE
      case UpvsIdentityUpvsEdeskStatusEnum.Deliverable:
        return EdeskStatus.DELIVERABLE
      case UpvsIdentityUpvsEdeskStatusEnum.Disabled:
        return EdeskStatus.DISABLED
      case UpvsIdentityUpvsEdeskStatusEnum.Deleted:
        return EdeskStatus.DISABLED // There is no Deleted status in Noris
    }
  }

  private mapEdeskDataToNorisType(item: {
    id: string
    uri: string | null
    edeskStatus: string | null
    edeskNumber: string | null
  }) {
    if (item.edeskStatus === null || item.edeskNumber === null || item.uri === null) {
      return {
        edeskStatus: EdeskStatus.NONEXISTENT as const,
        edeskNumber: null,
        uri: null,
      }
    }
    const upvsEdeskStatus = this.mapUpvsEdeskStatusToNorisType(item.edeskStatus)
    return {
      edeskStatus: upvsEdeskStatus,
      edeskNumber: item.edeskNumber,
      uri: item.uri,
    }
  }

  async retrieveNewRecordsFromNorisToUpdate() {
    const norisRecords = await this.norisService.getExternalEdeskChecks(
      PHYSICAL_PERSONS_RETRIEVE_BATCH_SIZE,
      LEGAL_PERSONS_RETRIEVE_BATCH_SIZE
    )
    await this.upvsQueueService.addExternalItemsToQueue(
      norisRecords.map((item) => ({ uri: item.uri_generated, norisId: item.id_noris }))
    )
  }

  async updateEdeskInNoris(): Promise<void> {
    const numberOfExternalItemsInQueue =
      await this.upvsQueueService.getNumberOfExternalItemsInQueue()
    if (numberOfExternalItemsInQueue === 0) {
      await this.retrieveNewRecordsFromNorisToUpdate()
    }

    const completedExternalItems = await this.upvsQueueService.retrieveCompletedExternalItems(
      EXTERNAL_ITEMS_PROCESS_BATCH_SIZE
    )

    if (
      completedExternalItems.length === 0 ||
      (completedExternalItems.length < EXTERNAL_ITEMS_PROCESS_BATCH_SIZE &&
        numberOfExternalItemsInQueue !== 0)
    ) {
      return
    }

    const isCompletedItem = (
      item: ExternalEdeskCheck
    ): item is ExternalEdeskCheck & { queueStatus: 'COMPLETED'; processedAt: Date } => {
      return item.queueStatus === QueueItemStatusEnum.COMPLETED && item.processedAt !== null
    }

    await this.norisService.updateEdeskChecks(
      completedExternalItems
        .filter(isCompletedItem)
        .map((item) => {
          try {
            const edeskData = this.mapEdeskDataToNorisType(item)
            return {
              idNoris: item.norisId,
              lastCheck: item.processedAt,
              ...edeskData,
            }
          } catch (error) {
            this.logger.error(
              this.throwerErrorGuard.InternalServerErrorException(
                ErrorsEnum.INTERNAL_SERVER_ERROR,
                'Error mapping eDesk data to Noris type',
                undefined,
                error
              )
            )
            return false
          }
        })
        .filter((item) => item !== false)
    )

    await this.prismaService.externalEdeskCheck.deleteMany({
      where: {
        id: { in: completedExternalItems.map((item) => item.id) },
      },
    })
  }
}
