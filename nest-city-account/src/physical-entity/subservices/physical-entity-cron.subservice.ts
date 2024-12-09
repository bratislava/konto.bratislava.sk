import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PhysicalEntityService } from '../physical-entity.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import * as z from 'zod'
import {
  PhysicalEntityUpdatedAtByRelationList,
  PhysicalEntityUpdatedAtByRelationListSchema,
} from '../dtos/physical-entity.dto'
import { HandleErrors } from '../../utils/decorators/errorHandler.decorators'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

const ValidateConfigValueSchema = z.object({
  active: z.boolean(),
  offset: z.number(),
})

@Injectable()
export class PhysicalEntityCronSubservice {
  private readonly logger: LineLoggerSubservice

  private readonly updatePhysicalEntityDataDbkey = 'UPDATE-PHYSICAL-ENTITY-DATA'

  // Limiting this to 1 will limit the monthly throughput to below 88000 PhysicalEntity updates. Be extra careful when raising this, as NASES gets angry about too many requests happening
  private readonly updateLimit = 1

  constructor(
    private readonly prismaService: PrismaService,
    private readonly physicalEntityService: PhysicalEntityService
  ) {
    this.logger = new LineLoggerSubservice(PhysicalEntityService.name)
  }

  /**
   * Retrieves a list of physical entities that need to be updated with RFO or UPVS data.
   *
   * WARNING: This function does not retrieve entities without any associated RFO and UPVS data. However, the
   * function can be modified to alter this behavior if necessary (see commented SQL code).
   *
   * We are using offset to skip updating old entities, that we were unable to update previously.
   * This is not a problem with new entities, as they are always later in the update list.
   *
   * @async
   * @param offset - The number of records to skip before returning the data.
   * @returns {PhysicalEntityUpdatedAtByRelationList|null} - A Promise that resolves to the list of physical entities with updated RFO data, or null if there was an error.
   */
  async getEntitiesToUpdate(offset = 0): Promise<PhysicalEntityUpdatedAtByRelationList | null> {
    const requestData = await this.prismaService.$queryRaw`
        SELECT pe.id as "physicalEntityId", pe."birthNumber" as "birthNumber"
        FROM "PhysicalEntity" pe
                 -- use LEFT JOIN to include entities with no RFO data
                 INNER JOIN (SELECT "physicalEntityId", MAX("updatedAt") as lastUpdatedAt
                             FROM "RfoByBirthnumber"
                             GROUP BY "physicalEntityId") rbb
                            ON pe.id = rbb."physicalEntityId"
            -- use LEFT JOIN to include entities with no UPVS data
                 INNER JOIN (SELECT "physicalEntityId", MAX("updatedAt") as lastUpdatedAt
                             FROM "UpvsIdentityByUri"
                             GROUP BY "physicalEntityId") uibu
                            ON pe.id = uibu."physicalEntityId"
        WHERE rbb.lastUpdatedAt < current_date - interval '1 month'
           or uibu.lastUpdatedAt < current_date - interval '1 month'
        ORDER BY LEAST(rbb.lastUpdatedAt, uibu.lastUpdatedAt)
        OFFSET ${offset} LIMIT ${this.updateLimit};`

    const validated = PhysicalEntityUpdatedAtByRelationListSchema.safeParse(requestData)

    if (!validated.success) {
      this.logger.error(
        `INCORRECT DATABASE DATA ERROR - we got invalid data from database ${JSON.stringify(
          requestData
        )}, ${validated.error}`
      )
      return null
    }
    return validated.data
  }

  private async getConfiguration(key: string) {
    const configDbResult = await this.prismaService.config.findUnique({
      where: { key },
    })
    if (!configDbResult) {
      throw new Error(`${key} not found in database config.`)
    }

    const config = ValidateConfigValueSchema.parse(configDbResult.value)
    if (!config.active) {
      return
    }
    this.logger.log(
      `${this.updatePhysicalEntityDataDbkey} turned ON, starting, current offset: ${config.offset}`
    )
    return config
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  @HandleErrors('Cron Error')
  async updateRfo(): Promise<void> {
    // get a number of entities, that we will skip (those, that we were unable to update the last time) from db
    const config = await this.getConfiguration(this.updatePhysicalEntityDataDbkey)
    if (!config) {
      return
    }

    // find entities to update
    const entitiesToUpdate = await this.getEntitiesToUpdate(config.offset)
    if (entitiesToUpdate === null) return

    // If no entities for updating found, reset offset.
    if (entitiesToUpdate.length == 0) {
      if (config.offset == 0) {
        this.logger.log(
          'NO VALID ENTITIES TO UPDATE PHYSICAL ENTITY - all entities were updated in the last month.'
        )
      } else {
        // This should eventually run, if we can run this job faster than RFO entries age.
        // If it does not run => old failed records will not be reattempted, but new records will be
        // eventually updated, as they will move up the queue
        this.logger.log('no entities found for RFO update. Resetting offset.')
        await this.prismaService.config.update({
          where: { key: this.updatePhysicalEntityDataDbkey },
          data: { value: { ...config, offset: 0 } },
        })
      }
      return
    }

    // Try to update them
    const failedToUpdate: string[] = []
    for (const entity of entitiesToUpdate) {
      // TODO split into RFO and UPVS requests, since we can do batch requests for UPVS?
      const result = await this.physicalEntityService.updateRfoAndUri(entity)
      if (!result) failedToUpdate.push(entity.birthNumber)
    }

    if (entitiesToUpdate.length < this.updateLimit) {
      this.logger.log(
        `Resetting offset for ${this.updatePhysicalEntityDataDbkey}. Only entities with failed updates remain at this moment.`
      )
      await this.prismaService.config.update({
        where: { key: this.updatePhysicalEntityDataDbkey },
        data: { value: { ...config, offset: 0 } },
      })
    } else if (failedToUpdate.length) {
      // Move offset, so that we don't try to update the same entity twice in a row. Entities with
      // failed updates should have the oldest update entries.
      this.logger.log(`Updating offset for ${this.updatePhysicalEntityDataDbkey}`)
      await this.prismaService.config.update({
        where: { key: this.updatePhysicalEntityDataDbkey },
        data: { value: { ...config, offset: config.offset + failedToUpdate.length } },
      })
    }
  }
}
