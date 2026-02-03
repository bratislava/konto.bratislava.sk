import { Injectable } from '@nestjs/common'
import { PhysicalEntity, Prisma } from '@prisma/client'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import { AdminErrorsEnum, AdminErrorsResponseEnum } from '../admin/admin.errors.enum'

import { PrismaService } from '../prisma/prisma.service'
import { RfoIdentityList, RfoIdentityListElement } from '../rfo-by-birthnumber/dtos/rfoSchema'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { MagproxyService } from '../magproxy/magproxy.service'
import { ApiIamIdentitiesIdGet200Response } from 'openapi-clients/slovensko-sk'
import { VerificationReturnType } from '../user-verification/types'
import { NasesService } from '../nases/nases.service'

// In the physicalEntity model, we're storing the data we have about physicalEntitys from magproxy or NASES. We request this data periodically (TODO) or on demand.

export type UpdateFromRFOResult = {
  physicalEntity: PhysicalEntity
  rfoData: RfoIdentityList | null
  upvsInput?: { uri: string; physicalEntityId: string }
  upvsResult?: ApiIamIdentitiesIdGet200Response
}

@Injectable()
export class PhysicalEntityService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly magproxyService: MagproxyService,
    private readonly nasesService: NasesService
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
      this.logger.error(
        `PhysicalEntity was not created in database for birth number: ${birthNumber}.`
      )
      return null
    }
    return entity
  }

  /**
   * Validates URIs and updates eDesk status for entities that already have URIs stored.
   * Used for periodic eDesk status refresh.
   *
   * For RFO-based identity resolution, use searchByPersonDataAndUpdateEdesk() instead.
   */
  async checkUriAndUpdateEdeskFromUpvs(
    upvsInput: { physicalEntityId: string; uri: string }[]
  ): Promise<PhysicalEntity[]> {
    if (upvsInput.length === 0) {
      return []
    }

    let validatedResults
    try {
      validatedResults = await this.nasesService.validateUrisWithEntityIds(upvsInput)
    } catch (error) {
      this.logger.error(`An error occurred while requesting data from UPVS`, { upvsInput }, error)
      // Mark all as failed
      await this.updateFailedActiveEdeskUpdateInDatabase({
        uri: { in: upvsInput.map((item) => item.uri) },
      })
      return []
    }

    // Get the URIs that were successfully validated
    const successfulUris = new Set(validatedResults.map((result) => result.uri))

    // Mark failed ones
    const failedUris = upvsInput.filter((input) => !successfulUris.has(input.uri))
    if (failedUris.length > 0) {
      await this.updateFailedActiveEdeskUpdateInDatabase({
        uri: { in: failedUris.map((item) => item.uri) },
      })
    }

    // Update successful ones
    const updatedEntities: PhysicalEntity[] = await Promise.all(
      validatedResults.map(async (item) => {
        return this.update({
          id: item.physicalEntityId ?? undefined,
          uri: item.uri,
          activeEdesk: item.data.upvs?.edesk_status === 'deliverable',
        })
      })
    )

    this.logger.log(
      `Successfully validated ${validatedResults.length} URIs, failed ${failedUris.length}`
    )
    return updatedEntities
  }

  async searchByPersonDataAndUpdateEdesk(params: {
    physicalEntityId: string
    familyName: string
    givenName: string
    dateOfBirth?: string
  }): Promise<{
    updatedEntity: PhysicalEntity | null
    upvsResult: ApiIamIdentitiesIdGet200Response | null
  }> {
    try {
      const results = await this.nasesService.searchUpvsIdentitiesByPersonData({
        familyName: params.familyName,
        givenName: params.givenName,
        dateOfBirth: params.dateOfBirth,
      })

      if (!Array.isArray(results) || results.length === 0) {
        this.logger.error(
          `No identity found for entityId ${params.physicalEntityId} with name: ${params.givenName} ${params.familyName}`
        )
        await this.updateFailedActiveEdeskUpdateInDatabase({ id: params.physicalEntityId })
        return { updatedEntity: null, upvsResult: null }
      }

      if (results.length > 1) {
        this.logger.error(
          `Multiple identities found for entityId ${params.physicalEntityId} with name: ${params.givenName} ${params.familyName}`
        )
        await this.updateFailedActiveEdeskUpdateInDatabase({ id: params.physicalEntityId })
        return { updatedEntity: null, upvsResult: null }
      }

      const result = results[0]

      if (!result.uri) {
        this.logger.error(
          `No URI in result for entityId ${params.physicalEntityId} with name: ${params.givenName} ${params.familyName}`
        )
        await this.updateFailedActiveEdeskUpdateInDatabase({ id: params.physicalEntityId })
        return { updatedEntity: null, upvsResult: null }
      }

      const updatedEntity = await this.update({
        id: params.physicalEntityId,
        uri: result.uri,
        activeEdesk: result.upvs?.edesk_status === 'deliverable',
      })

      this.logger.log(
        `Successfully found identity for entityId ${params.physicalEntityId}: ${result.uri}`
      )
      return { updatedEntity, upvsResult: result }
    } catch (error) {
      this.logger.error(
        `An error occurred while searching UPVS for entityId ${params.physicalEntityId}`,
        error
      )
      await this.updateFailedActiveEdeskUpdateInDatabase({ id: params.physicalEntityId })
      return { updatedEntity: null, upvsResult: null }
    }
  }

  private parseRfoDataToUpvsSearchParams(
    singleRfoRecord: RfoIdentityListElement,
    entity: PhysicalEntity
  ) {
    if (!singleRfoRecord.priezviskaOsoby || !singleRfoRecord.menaOsoby) {
      return null
    }

    const firstName = singleRfoRecord.menaOsoby
      ?.sort((a, b) => {
        return (a.poradieMena ?? 0) - (b.poradieMena ?? 0)
      })
      .map((meno) => meno.meno)
      .join(' ')
    const lastName = singleRfoRecord.priezviskaOsoby
      ?.sort((a, b) => {
        return (a.poradiePriezviska ?? 0) - (b.poradiePriezviska ?? 0)
      })
      .map((meno) => meno.meno)
      .join(' ')

    if (!firstName || !lastName) {
      return null
    }

    this.logger.log(
      `Trying to verify identity for entityId ${entity.id} using name: ${firstName} ${lastName}`
    )
    return {
      physicalEntityId: entity.id,
      familyName: lastName,
      givenName: firstName,
      dateOfBirth: singleRfoRecord.datumNarodenia ?? undefined,
    }
  }

  async createFromBirthNumber(
    birthNumber: string
  ): Promise<VerificationReturnType<RfoIdentityList>> {
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
    if (!rfoData.success || rfoData.data.length == 0) {
      this.logger.error(`PhysicalEntity ${birthNumber} not created. No entries from magproxy.`)
      return rfoData
    }

    // Multiple data present
    if (rfoData.data.length > 1) {
      this.logger.error(
        `PhysicalEntity ${birthNumber} not created. Multiple entries from magproxy.`
      )
      return rfoData
    }

    const singleRfoRecord = rfoData.data[0]

    const upvsSearchParams = this.parseRfoDataToUpvsSearchParams(singleRfoRecord, entity)

    if (!upvsSearchParams) {
      return rfoData
    }

    await this.searchByPersonDataAndUpdateEdesk(upvsSearchParams)
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
        AdminErrorsResponseEnum.BIRTH_NUMBER_NOT_FOUND
      )
    }

    // const rfoData = JSON.parse(result.data.toString()) as RfoIdentityList
    const rfoData = await this.magproxyService.rfoBirthNumberList(entity.birthNumber)
    if (!rfoData.success || !Array.isArray(rfoData.data) || rfoData.data.length === 0) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        `Incorrect or no data returned from RFO for birthnumber ${entity.birthNumber} entityId: ${entity.id}, data: ${rfoData}`
      )
    }

    if (rfoData.data.length > 1) {
      this.logger.error(
        `Found multiple RFO records for birthnumber ${entity.birthNumber} entityId: ${entity.id}`
      )
      return {
        physicalEntity: entity,
        rfoData: rfoData.data,
      }
    }

    // TODO if we're storing other data about entity from RFO, do it here

    const singleRfoRecord = rfoData.data[0]

    const upvsSearchParams = this.parseRfoDataToUpvsSearchParams(singleRfoRecord, entity)

    if (!upvsSearchParams) {
      return {
        physicalEntity: entity,
        rfoData: rfoData.data,
      }
    }

    const { updatedEntity, upvsResult } =
      await this.searchByPersonDataAndUpdateEdesk(upvsSearchParams)

    return {
      physicalEntity: updatedEntity ?? entity,
      rfoData: rfoData.data,
      upvsInput: upvsSearchParams
        ? {
            uri: upvsResult?.uri ?? '',
            physicalEntityId: upvsSearchParams.physicalEntityId,
          }
        : undefined,
      upvsResult: upvsResult ?? undefined,
    }
  }

  /**
   * Updates eDesk status for entities that already have URIs stored.
   * Processes in batches of 10 (UPVS limit).
   */
  async updateEdeskFromUpvs(where: Prisma.PhysicalEntityWhereInput): Promise<void>
  async updateEdeskFromUpvs(entities: PhysicalEntity[]): Promise<void>
  async updateEdeskFromUpvs(
    whereOrEntities: Prisma.PhysicalEntityWhereInput | PhysicalEntity[]
  ): Promise<void> {
    let physicalEntitiesFromDb: PhysicalEntity[]

    if (Array.isArray(whereOrEntities)) {
      physicalEntitiesFromDb = whereOrEntities
    } else {
      physicalEntitiesFromDb = await this.prismaService.physicalEntity.findMany({
        where: whereOrEntities,
      })
    }

    const upvsInput: { physicalEntityId: string; uri: string }[] = physicalEntitiesFromDb
      .filter((physicalEntity) => physicalEntity.uri)
      .map((physicalEntity) => {
        return { physicalEntityId: physicalEntity.id, uri: physicalEntity.uri! }
      })

    // Process in chunks of 10 (UPVS limit)
    for (let i = 0; i < upvsInput.length; i += 10) {
      const chunk = upvsInput.slice(i, i + 10)
      await this.checkUriAndUpdateEdeskFromUpvs(chunk)
    }
  }

  async updateFailedActiveEdeskUpdateInDatabase(where: Prisma.PhysicalEntityWhereInput) {
    await this.prismaService.physicalEntity.updateMany({
      where,
      data: {
        activeEdeskUpdateFailedAt: new Date(),
        activeEdeskUpdateFailCount: { increment: 1 },
      },
    })
  }

  // TODO either change or cleanup and use db directly
  async update(data: Partial<PhysicalEntity>): Promise<PhysicalEntity> {
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
