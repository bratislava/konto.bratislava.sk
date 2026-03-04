import { Injectable } from '@nestjs/common'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { PrismaService } from '../../prisma/prisma.service'
import { UpvsQueueService } from '../../upvs-queue/upvs-queue.service'

@Injectable()
export class EdeskTasksSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly upvsQueueService: UpvsQueueService
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
}
