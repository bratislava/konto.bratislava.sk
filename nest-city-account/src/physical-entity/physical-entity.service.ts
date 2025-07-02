import { Injectable } from '@nestjs/common'
import { PhysicalEntity, UpvsIdentityByUri } from '@prisma/client'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import { AdminErrorsEnum } from '../admin/admin.errors.enum'

import { PrismaService } from '../prisma/prisma.service'
import { RfoIdentityList, RfoIdentityListElement } from '../rfo-by-birthnumber/dtos/rfoSchema'
import { parseUriNameFromRfo } from '../magproxy/dtos/uri'
import { UpvsIdentity } from '../upvs-identity-by-uri/dtos/upvsSchema'
import { UpvsIdentityByUriService } from '../upvs-identity-by-uri/upvs-identity-by-uri.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { MagproxyService } from '../magproxy/magproxy.service'

// In the physicalEntity model, we're storing the data we have about physicalEntitys from magproxy or NASES. We request this data periodically (TODO) or on demand.

export type UpdateFromRFOResult = {
  physicalEntity: PhysicalEntity
  rfoData: RfoIdentityList | null
  upvsInput?: Array<{ uri: string; physicalEntityId: string }>
  upvsResult?: UpvsIdentityByUri
}

@Injectable()
export class PhysicalEntityService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly magproxyService: MagproxyService,
    private readonly upvsIdentityByUriService: UpvsIdentityByUriService
  ) {
    this.logger = new LineLoggerSubservice(PhysicalEntityService.name)
  }

  async linkToUserIdByBirthnumber(userId: string, birthNumber: string) {
    const entities = await this.prismaService.physicalEntity.findMany({
      where: { birthNumber },
    })
    if (entities.length > 1) {
      this.logger.error(`Multiple physical entities in database with birthnumber ${birthNumber}.`)
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
  private async getOrCreateEmptyFromBirthNumber(
    birthNumber: string
  ): Promise<PhysicalEntity | null> {
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
      this.logger.error(`PhysicalEntity was not created in database ${birthNumber}.`)
      return null
    }
    return entity
  }

  async checkUriAndUpdateEdeskFromUpvs(upvsInput: {
    physicalEntityId?: string | null | undefined
    uri: string
  }) {
    let upvsResult: {
      success: UpvsIdentityByUri[]
      failed: { physicalEntityId?: string; uri: string }[]
    } | null = null
    try {
      upvsResult = await this.upvsIdentityByUriService.createMany([upvsInput])
    } catch (error) {
      this.logger.error(`An error occurred while requesting data from UPVS`, { upvsInput }, error)
    }
    if (!upvsResult) {
      return {}
    }

    if (upvsResult.success.length > 1) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        `Multiple successful UPVS results for uri input ${JSON.stringify(
          upvsInput
        )}, this shouldn't be possible`
      )
    }
    if (upvsResult.success.length === 0) {
      this.logger.error(
        `No successful UPVS results for uri input ${JSON.stringify(
          upvsInput
        )}, requires manual intervention`
      )
      return {}
    }

    const upvsSuccessValue = upvsResult.success[0]

    const updatedEntity = await this.update({
      id: upvsSuccessValue.physicalEntityId ?? undefined,
      uri: upvsSuccessValue.uri,
      activeEdesk: (upvsSuccessValue.data as UpvsIdentity)?.upvs?.edesk_status === 'deliverable',
    })

    this.logger.log(`Successfully verified uri input ${JSON.stringify(upvsInput)}`)
    return { updatedEntity, upvsResult: upvsSuccessValue }
  }

  private parseRfoDataToUpvsInput(singleRfoRecord: RfoIdentityListElement, entity: PhysicalEntity) {
    if (!singleRfoRecord.priezviskaOsoby) {
      return null
    }

    // Fill additional info
    const uriName = parseUriNameFromRfo(singleRfoRecord)
    if (!uriName || !entity.birthNumber) {
      return null
    }

    const processedBirthNumber = entity.birthNumber.replaceAll('/', '')
    const uri = `rc://sk/${processedBirthNumber}_${uriName}`
    this.logger.log(`Trying to verify the following uri for entityId ${entity.id}: ${uri}`)
    return { uri, physicalEntityId: entity.id }
  }

  async createFromBirthNumber(birthNumber: string) {
    // Creates PhysicalEntity record before user is verified / created. The new record does not have
    // userID set.

    // Get data from magproxyService
    // const data = await this.magproxyService.rfoBirthNumberList(birthNumber)

    const entity = await this.getOrCreateEmptyFromBirthNumber(birthNumber)

    // Get rfo data
    const rfoData = await this.magproxyService.rfoBirthNumberList(birthNumber)
    if (!entity) {
      return rfoData
    }

    // No data present, return
    if (!rfoData || rfoData.length == 0) {
      this.logger.error(`PhysicalEntity ${birthNumber} not created. No entries from magproxy.`)
      return rfoData
    }

    // Multiple data present
    if (rfoData.length > 1) {
      this.logger.error(
        `PhysicalEntity ${birthNumber} not created. Multiple entries from magproxy.`
      )
      return rfoData
    }

    const singleRfoRecord = rfoData[0]

    const upvsInput = this.parseRfoDataToUpvsInput(singleRfoRecord, entity)

    if (!upvsInput) {
      return rfoData
    }

    await this.checkUriAndUpdateEdeskFromUpvs(upvsInput)
    return rfoData
  }

  async updateFromRFO(physicalEntityId: string): Promise<UpdateFromRFOResult> {
    // gets physicalEntity record by id, looks for existing birthnumber stored in it, creates RfoByBirthnumberRequest and parses data form it into columns
    // this can be called on demand or scheduled / ran periodically
    const entity = await this.prismaService.physicalEntity.findUnique({
      where: { id: physicalEntityId },
    })
    if (!entity) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `PhysicalEntity with id ${physicalEntityId} not found`
      )
    }
    if (!entity.birthNumber) {
      throw this.throwerErrorGuard.NotFoundException(
        AdminErrorsEnum.BIRTH_NUMBER_NOT_FOUND,
        AdminErrorsEnum.BIRTH_NUMBER_NOT_FOUND
      )
    }

    // const rfoData = JSON.parse(result.data.toString()) as RfoIdentityList
    const rfoData = await this.magproxyService.rfoBirthNumberList(entity.birthNumber)
    if (!Array.isArray(rfoData) || rfoData.length === 0) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        `Incorrect or no data returned from RFO for birthnumber ${entity.birthNumber} entityId: ${entity.id}, data: ${rfoData}`
      )
    }

    if (rfoData.length > 1) {
      this.logger.error(
        `Found multiple RFO records for birthnumber ${entity.birthNumber} entityId: ${entity.id}`
      )
      return {
        physicalEntity: entity,
        rfoData,
      }
    }

    // TODO if we're storing other data about entity from RFO, do it here

    const singleRfoRecord = rfoData[0]

    const upvsInput = this.parseRfoDataToUpvsInput(singleRfoRecord, entity)

    if (!upvsInput) {
      return {
        physicalEntity: entity,
        rfoData,
      }
    }

    const { updatedEntity, upvsResult } = await this.checkUriAndUpdateEdeskFromUpvs(upvsInput)

    const upvsInputArray = [upvsInput]

    return {
      physicalEntity: updatedEntity ?? entity,
      rfoData,
      upvsInput: upvsInputArray,
      upvsResult,
    }
  }

  // TODO either change or cleanup and use db directly
  async update(data: Partial<PhysicalEntity>): Promise<PhysicalEntity> {
    if (!data.id) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'PhysicalEntity id must be provided to update service'
      )
    }
    const physicalEntity = await this.prismaService.physicalEntity.update({
      where: { id: data.id },
      data,
    })
    return physicalEntity
  }
}
