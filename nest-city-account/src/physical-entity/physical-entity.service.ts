import { Injectable, Logger } from '@nestjs/common'
import { PhysicalEntity, UpvsIdentityByUri } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'
import { RfoIdentityList } from '../rfo-by-birthnumber/dtos/rfoSchema'
import { RfoByBirthnumberService } from '../rfo-by-birthnumber/rfo-by-birthnumber.service'
import { parseUriNameFromRfo } from '../rfo-by-birthnumber/utils/uri'
import { UpvsIdentity } from '../upvs-identity-by-uri/dtos/upvsSchema'
import { UpvsIdentityByUriService } from '../upvs-identity-by-uri/upvs-identity-by-uri.service'
import { ErrorThrowerGuard } from '../utils/guards/errors.guard'

// In the physicalEntity model, we're storing the data we have about physicalEntitys from magproxy or NASES. We request this data periodically (TODO) or on demand.

export type UpdateFromRFOResult = {
  physicalEntity: PhysicalEntity
  rfoData: RfoIdentityList | null
  upvsInput?: Array<{ uri: string; physicalEntityId: string }>
  upvsResult?: UpvsIdentityByUri
}

@Injectable()
export class PhysicalEntityService {
  private readonly logger = new Logger(PhysicalEntityService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly errorThrowerGuard: ErrorThrowerGuard,
    private readonly rfoByBirthnumberService: RfoByBirthnumberService,
    private readonly upvsIdentityByUriService: UpvsIdentityByUriService
  ) {}

  // TODO either use or remove
  async createFromUser(userId: string, uri?: string, edesk?: string): Promise<boolean> {
    // gets user record by id, looks for verified birthnumber stored in it, creates PhysicalEntity and prefills what we can
    // to be called when user is verified / filled in from existing users
    // optional uri & edesk status object - if we have a verified uri at the time of creation, we can use it to fill in more data

    // should return the created physicalEntity object
    return true
  }

  async updateFromRFO(physicalEntityId: string): Promise<UpdateFromRFOResult> {
    // gets physicalEntity record by id, looks for existing birthnumber stored in it, creates RfoByBirthnumberRequest and parses data form it into columns
    // this can be called on demand or scheduled / ran periodically
    const entity = await this.prismaService.physicalEntity.findUnique({
      where: { id: physicalEntityId },
    })
    if (!entity) {
      throw this.errorThrowerGuard.badRequestException(
        `PhysicalEntity with id ${physicalEntityId} not found`
      )
    }
    if (!entity.birthNumber) {
      throw this.errorThrowerGuard.adminDatabaseBirthNumberNotFound()
    }

    const result = await this.rfoByBirthnumberService.create(entity.birthNumber, entity.id)
    if (result === null || result.data === null) {
      throw this.errorThrowerGuard.badRequestException(
        `There is no user for birth number ${entity.birthNumber}`
      )
    }

    const rfoData = JSON.parse(result.data.toString()) as RfoIdentityList
    if (!Array.isArray(rfoData) || rfoData.length === 0) {
      throw this.errorThrowerGuard.unexpectedError(
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
        throw this.errorThrowerGuard.unexpectedError(
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

  // TODO either use or remove
  async updateFromUri(physicalEntityId: string): Promise<boolean> {
    // similar to updateRFO

    // should return the updated physicalEntity object
    return true
  }

  // TODO either change or cleanup and use db directly
  async update(data: Partial<PhysicalEntity>): Promise<PhysicalEntity> {
    if (!data.id)	 {
      throw this.errorThrowerGuard.badRequestException(	
        'PhysicalEntity id must be provided to update service'	
      )
    }
    return this.prismaService.physicalEntity.update({
      where: { id: data.id },
      data,
    })
  }
}
