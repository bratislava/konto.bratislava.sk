import { Injectable } from '@nestjs/common'
import { PhysicalEntity } from '@prisma/client'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'

import { PrismaService } from '../prisma/prisma.service'
import { UpvsIdentityByUriSuccessType } from '../nases/nases.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@Injectable()
export class PhysicalEntityService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(PhysicalEntityService.name)
  }

  async linkToUserIdByBirthnumber(userId: string, birthNumber: string) {
    const entities = await this.prismaService.physicalEntity.findMany({
      where: { birthNumber },
    })
    if (entities.length > 1) {
      this.logger.error(`Multiple physical entities in database with birthnumber: ${birthNumber}.`)
      return
    }
    if (entities.length === 0) {
      this.logger.error(`Entity with birth number ${birthNumber} does not exist.`)
      return
    }

    await this.prismaService.physicalEntity.update({
      where: { id: entities[0].id },
      data: { userId },
    })
    return
  }

  /**
   * Retrieves or creates a single empty physical entity without a user and without filling any other data
   *
   * @param {string} birthNumber - The birth number used to retrieve or create the physical entity.
   * @returns {Promise<PhysicalEntity | null>} - The retrieved or created physical entity.
   *                                    Returns null if multiple entities with the same birth number exist, or if entity creation fails.
   */
  async getOrCreateEmptyFromBirthNumber(birthNumber: string): Promise<PhysicalEntity | null> {
    const entities = await this.prismaService.physicalEntity.findMany({
      where: { birthNumber },
    })
    if (entities.length > 1) {
      this.logger.error(
        `PhysicalEntity with birthnumber ${birthNumber} multiple times in database.`
      )
      return null
    }

    let entity: PhysicalEntity
    if (!entities || entities.length === 0) {
      entity = await this.prismaService.physicalEntity.create({
        data: { birthNumber: birthNumber },
      })
    } else {
      entity = entities[0]
    }

    // Could not create entity
    if (!entity || !entity.birthNumber) {
      this.logger.error(
        `PhysicalEntity was not created in database for birth number: ${birthNumber}.`
      )
      return null
    }
    return entity
  }

  async updateSuccessfulActiveEdeskUpdateInDatabase(successArray: UpvsIdentityByUriSuccessType[]) {
    const upvsSuccessValueArray = successArray.map((item) => {
      return {
        id: item.physicalEntityId ?? undefined,
        uri: item.uri,
        activeEdesk: item.data.upvs?.edesk_status === 'deliverable',
      }
    })

    await Promise.all(
      upvsSuccessValueArray.map(async (item) => {
        return this.update(item)
      })
    )
  }

  async updateFailedActiveEdeskUpdateInDatabase(ids: string[]) {
    await this.prismaService.physicalEntity.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        activeEdeskUpdateFailedAt: new Date(),
        activeEdeskUpdateFailCount: { increment: 1 },
      },
    })
  }

  private async update(data: Partial<PhysicalEntity>): Promise<PhysicalEntity> {
    if (!data.id) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'PhysicalEntity id must be provided to update service'
      )
    }

    // if activeEdesk is being updated, delete metadata about failed updates
    let dataWithEdeskMetadata: Partial<PhysicalEntity> = data
    if (data.activeEdesk !== null && data.activeEdesk !== undefined) {
      dataWithEdeskMetadata = {
        ...data,
        activeEdeskUpdateFailedAt: null,
        activeEdeskUpdateFailCount: 0,
        activeEdeskUpdatedAt: new Date(),
      }
    }

    const physicalEntity = await this.prismaService.physicalEntity.update({
      where: { id: data.id },
      data: dataWithEdeskMetadata,
    })
    return physicalEntity
  }
}
