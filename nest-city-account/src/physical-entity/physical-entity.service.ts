import { Injectable, Logger } from '@nestjs/common'
import { PhysicalEntity, UpvsIdentityByUri } from '@prisma/client'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import { AdminErrorsEnum } from '../admin/admin.errors.enum'

import { PrismaService } from '../prisma/prisma.service'
import { RfoIdentityList } from '../rfo-by-birthnumber/dtos/rfoSchema'
import { RfoByBirthnumberService } from '../rfo-by-birthnumber/rfo-by-birthnumber.service'
import { parseUriNameFromRfo } from '../rfo-by-birthnumber/utils/uri'
import { UpvsIdentity } from '../upvs-identity-by-uri/dtos/upvsSchema'
import { UpvsIdentityByUriService } from '../upvs-identity-by-uri/upvs-identity-by-uri.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PhysicalEntityUpdatedAtByRelation } from './dtos/physical-entity.dto'
import { MagproxyErrorsEnum } from '../magproxy/magproxy.errors.enum'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

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
    private readonly rfoByBirthnumberService: RfoByBirthnumberService,
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
   * @returns {Promise<PhysicalEntity>} - The retrieved or created physical entity.
   *                                    Returns null if multiple entities with the same birth number exist, or if entity creation fails.
   */
  private async getOrCreateEmptyFromBirthNumber(birthNumber: string) {
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
    if (!entity) {
      this.logger.error(`PhysicalEntity was not created in database ${birthNumber}.`)
      return null
    }
    if (!entity.birthNumber) {
      this.logger.error(`PhysicalEntity was not created in database ${birthNumber}.`)
      return null
    }

    return entity
  }

  async createFromBirthNumber(birthNumber: string) {
    // Creates PhysicalEntity record before user is verified / created. The new record does not have
    // userID set.

    // Get data from magproxyService
    // const data = await this.magproxyService.rfoBirthNumberList(birthNumber)

    const entity = await this.getOrCreateEmptyFromBirthNumber(birthNumber)

    // Create rfoByBirthnumber log
    const { request: data } = await this.rfoByBirthnumberService.create(birthNumber, entity?.id)
    if (!entity) {
      return data
    }

    // No data present, return
    if (!data || data.length == 0) {
      this.logger.error(`PhysicalEntity ${birthNumber} not created. No entries from magproxy.`)
      return data
    }
    if (data.length > 1) {
      this.logger.error(
        `PhysicalEntity ${birthNumber} not created. Multiple entries from magproxy.`
      )
      return data
    }

    if (!data[0].priezviskaOsoby) {
      return data
    }

    const priezviska = data[0].priezviskaOsoby.map((item) => ({
      meno: item.meno,
      poradiePriezviska: item.poradiePriezviska,
    }))

    // Fill additional info
    const uriName = parseUriNameFromRfo({
      menaOsoby: data[0].menaOsoby,
      priezviskaOsoby: priezviska,
    })
    if (!uriName || !entity.birthNumber) {
      return data
    }
    const processedBirthNumber = entity.birthNumber.replaceAll('/', '')
    const uri = `rc://sk/${processedBirthNumber}_${uriName}`
    this.logger.log(`Trying to verify the following uri for entityId ${entity.id}: ${uri}`)
    const upvsInput = [{ uri, physicalEntityId: entity.id }]

    // TODO: We may not want to kill verification just because of UPVS not responding. This is a temporary fix I need to look at later
    let upvsResult: {
      success: UpvsIdentityByUri[]
      failed: { physicalEntityId?: string; uri: string }[]
    } | null = null
    try {
      upvsResult = await this.upvsIdentityByUriService.createMany(upvsInput)
    } catch (error) {
      this.logger.error(`An error occurred while requesting data from UPVS: ${error}`)
    }
    if (!upvsResult) {
      return data
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
      return data
    }

    this.logger.log(`Successfully verified uri input ${JSON.stringify(upvsInput)}`)
    const upvsSuccessValue = upvsResult.success[0]
    await this.update({
      id: upvsSuccessValue.physicalEntityId ?? undefined,
      uri: upvsSuccessValue.uri,
      activeEdesk: (upvsSuccessValue.data as UpvsIdentity)?.upvs?.edesk_status === 'deliverable',
    })
    return data
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

    const { rfoByBirthNumber: result, request } = await this.rfoByBirthnumberService.create(
      entity.birthNumber,
      entity.id
    )
    if (result === null || result.data === null) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `There is no user for birth number ${entity.birthNumber}`
      )
    }

    // const rfoData = JSON.parse(result.data.toString()) as RfoIdentityList
    const rfoData = request
    if (!Array.isArray(rfoData) || rfoData.length === 0) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        `Incorrect or no data returned from RFO for birthnumber ${entity.birthNumber} entityId: ${entity.id}, data: ${result?.data}`
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

    // try to construct uri from first & last name in rfo result
    // TODO multiple ways to construct the uri
    const uriName = parseUriNameFromRfo(rfoData[0])
    if (uriName) {
      let maybeUpdatedEntity = entity
      const processedBirthNumber = entity.birthNumber.replaceAll('/', '')
      const uri = `rc://sk/${processedBirthNumber}_${uriName}`
      this.logger.log(`Trying to verify the following uri for entityId ${physicalEntityId}: ${uri}`)
      const upvsInput = [{ uri, physicalEntityId: entity.id }]
      const upvsResult = await this.upvsIdentityByUriService.createMany(upvsInput)
      if (upvsResult.success.length > 1) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
          `Multiple successful UPVS results for uri input ${JSON.stringify(
            upvsInput
          )}, this shouldn't be possible`
        )
      } else if (upvsResult.success.length === 0) {
        this.logger.error(
          `No successful UPVS results for uri input ${JSON.stringify(
            upvsInput
          )}, requires manual intervention`
        )
        return {
          physicalEntity: entity,
          rfoData,
        }
      } else {
        this.logger.log(`Successfully verified uri input ${JSON.stringify(upvsInput)}`)
        const upvsSuccessValue = upvsResult.success[0]
        maybeUpdatedEntity = await this.update({
          id: upvsSuccessValue.physicalEntityId ?? undefined,
          uri: upvsSuccessValue.uri,
          activeEdesk:
            (upvsSuccessValue.data as UpvsIdentity)?.upvs?.edesk_status === 'deliverable',
        })
        return {
          physicalEntity: maybeUpdatedEntity,
          rfoData,
          upvsInput,
          upvsResult: upvsSuccessValue,
        }
      }
    }
    return {
      physicalEntity: entity,
      rfoData,
    }
  }

  async updateRfoAndUri(entity: PhysicalEntityUpdatedAtByRelation): Promise<boolean> {
    const { rfoByBirthNumber: result, request: rfoData } =
      await this.rfoByBirthnumberService.create(entity.birthNumber, entity.physicalEntityId)
    if (result === null || result.data === null) {
      throw this.throwerErrorGuard.BadRequestException(
        MagproxyErrorsEnum.BIRTH_NUMBER_NOT_EXISTS,
        `There is no user for birth number ${entity.birthNumber}`
      )
    }

    if (!Array.isArray(rfoData) || rfoData.length === 0) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        MagproxyErrorsEnum.RFO_DATA_ARRAY_EXPECTED,
        `Incorrect or no data returned from RFO for birthnumber ${entity.birthNumber} entityId: ${entity.physicalEntityId}, data: ${result?.data}`
      )
    }

    if (rfoData.length > 1) {
      this.logger.error(
        `Found multiple RFO records for birthnumber ${entity.birthNumber} entityId: ${entity.physicalEntityId}`
      )
      return false
    }

    // try to construct uri from first & last name in rfo result
    const uriName = parseUriNameFromRfo(rfoData[0])
    if (!uriName) {
      return false
    }
    const processedBirthNumber = entity.birthNumber.replaceAll('/', '')
    const uri = `rc://sk/${processedBirthNumber}_${uriName}`
    this.logger.log(
      `Trying to verify the following uri for entityId ${entity.physicalEntityId}: ${uri}`
    )
    const upvsInput = [{ uri, physicalEntityId: entity.physicalEntityId }]
    const upvsResult = await this.upvsIdentityByUriService.createMany(upvsInput)
    if (upvsResult.success.length > 1) {
      this.logger.error(
        `Multiple successful UPVS results for uri input ${JSON.stringify(
          upvsInput
        )}, this shouldn't be possible`
      )
      return false
    } else if (upvsResult.success.length === 0) {
      this.logger.error(
        `No successful UPVS results for uri input ${JSON.stringify(
          upvsInput
        )}, requires manual intervention`
      )
      return false
    } else {
      this.logger.log(`Successfully verified uri input ${JSON.stringify(upvsInput)}`)
      const upvsSuccessValue = upvsResult.success[0]
      if (upvsSuccessValue.physicalEntityId) {
        await this.prismaService.physicalEntity.update({
          where: { id: upvsSuccessValue.physicalEntityId },
          data: {
            uri: upvsSuccessValue.uri,
            activeEdesk:
              (upvsSuccessValue.data as UpvsIdentity)?.upvs?.edesk_status === 'deliverable',
          },
        })
      } else {
        return false
      }
    }
    return true
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