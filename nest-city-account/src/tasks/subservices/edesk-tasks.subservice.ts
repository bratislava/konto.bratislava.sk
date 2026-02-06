import { Injectable } from '@nestjs/common'
import { PhysicalEntity } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { PhysicalEntityService } from '../../physical-entity/physical-entity.service'

const EDESK_UPDATE_LOOK_BACK_HOURS = 96

@Injectable()
export class EdeskTasksSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly physicalEntityService: PhysicalEntityService
  ) {
    this.logger = new LineLoggerSubservice(EdeskTasksSubservice.name)
  }

  async updateEdesk(): Promise<void> {
    const lookBackDate = new Date()
    lookBackDate.setHours(lookBackDate.getHours() - EDESK_UPDATE_LOOK_BACK_HOURS)

    const entitiesToUpdate = await this.prismaService.$queryRaw<PhysicalEntity[]>`
      SELECT e.*
      FROM "PhysicalEntity" e
      WHERE "userId" IS NOT NULL
        AND "uri" IS NOT NULL
        AND ("activeEdeskUpdatedAt" IS NULL OR "activeEdeskUpdatedAt" < ${lookBackDate})
        AND ("activeEdeskUpdateFailedAt" IS NULL OR
             "activeEdeskUpdateFailCount" = 0 OR
             ("activeEdeskUpdateFailedAt" + (POWER(2, least("activeEdeskUpdateFailCount", 7)) * INTERVAL '1 hour') < ${lookBackDate}))

      ORDER BY greatest("activeEdeskUpdatedAt", "activeEdeskUpdateFailedAt") NULLS FIRST
      LIMIT 5;
    `

    if (entitiesToUpdate.length === 0) {
      this.logger.log('No physical entities to update edesk.')
      return
    }

    await this.physicalEntityService.updateEdeskFromUpvs(entitiesToUpdate)
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
