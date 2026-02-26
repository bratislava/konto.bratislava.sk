import { Injectable } from '@nestjs/common'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { PrismaService } from '../../prisma/prisma.service'
import { UpvsQueueService } from '../../upvs-queue/upvs-queue.service'
import { NorisService } from '../../noris/noris.service'
import { EdeskStatus } from '../../noris/types/noris.types'
import { UpvsIdentityUpvsEdeskStatusEnum } from 'openapi-clients/slovensko-sk'
import { z } from 'zod'

@Injectable()
export class EdeskTasksSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly upvsQueueService: UpvsQueueService,
    private readonly norisService: NorisService
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
        return EdeskStatus.DISABLED // TODO: is this correct?
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
    const norisRecords = await this.norisService.getExternalEdeskChecks(100, 100)
    await this.upvsQueueService.addExternalItemsToQueue(
      norisRecords.map((item) => ({ uri: item.uri_generated, externalId: item.id_noris }))
    )
  }

  async updateEdeskInNoris(): Promise<void> {
    const finishedExternalItems = await this.upvsQueueService.retrieveFinishedExternalItems(100)

    if (finishedExternalItems.length === 0) {
      await this.retrieveNewRecordsFromNorisToUpdate()
      return
    }

    await this.norisService.updateEdeskChecks(
      finishedExternalItems.map((item) => ({
        idNoris: item.externalId,
        lastCheck: new Date(),
        edeskPCO: item.edeskPCO,
        ...this.mapEdeskDataToNorisType(item),
      }))
    )

    await this.prismaService.externalEdeskCheck.deleteMany({
      where: {
        id: { in: finishedExternalItems.map((item) => item.id) },
      },
    })
  }
}
