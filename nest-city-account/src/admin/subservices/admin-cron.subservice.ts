/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Config, UpvsIdentityByUri } from '@prisma/client'
import { AdminService } from 'src/admin/admin.service'
import { PhysicalEntityService } from 'src/physical-entity/physical-entity.service'
import * as z from 'zod'
import { PrismaService } from '../../prisma/prisma.service'
import HandleErrors from '../../utils/decorators/errorHandler.decorators'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import {
  COGNITO_SYNC_CONFIG_DB_KEY,
  EDESK_COGNITO_CONFIG_DB_KEY,
  EDESK_RFO_CONFIG_DB_KEY,
} from '../utils/constants'

const ValidateEdeskConfigValueSchema = z.object({
  active: z.boolean(),
  offset: z.number(),
})

const SyncCognitoToDbConfigValueSchema = z.object({
  active: z.boolean(),
})

@Injectable()
export class AdminCronSubservice {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(AdminCronSubservice.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminService: AdminService,
    private readonly physicalEntityService: PhysicalEntityService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  @HandleErrors('Cron Error')
  async validateEdeskFromCognitoData(): Promise<void> {
    const configDbResult = await this.prismaService.config.findUnique({
      where: { key: EDESK_COGNITO_CONFIG_DB_KEY },
    })
    if (!configDbResult) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `${EDESK_COGNITO_CONFIG_DB_KEY} not found in database config.`
      )
    }

    const config = ValidateEdeskConfigValueSchema.parse(configDbResult.value)
    if (!config.active) {
      return
    }
    this.logger.log(
      `${EDESK_COGNITO_CONFIG_DB_KEY} turned ON, starting, current offset: ${config.offset}`
    )

    const result = await this.adminService.validateEdeskWithUriFromCognito(config.offset)
    const validatedUsers = result.validatedUsers
    const mappingFn = (
      upvsResult: UpvsIdentityByUri | { physicalEntityId?: string; uri: string }
    ) => `uri: ${upvsResult.uri} physicalEntityId: ${upvsResult.physicalEntityId}`
    const successData = result.entities.success.map(mappingFn)
    const failedData = result.entities.failed.map(mappingFn)
    this.logger.log(
      `${EDESK_COGNITO_CONFIG_DB_KEY} done: validatedUsers: ${validatedUsers} successData: ${successData} failedData: ${failedData}`
    )

    if (failedData.length > 0) {
      // expected result was that in the (up to) 100 uris we've sent to validate there are at least 10 correct ones (UPVS returns up to 10 entities)
      // if failed data exists, there were less than 10 - we need to move the offset past the users for whom we can't construct the correct uris
      const physicalEntitiesWithoutUriVerificationAttemptsCount =
        await this.prismaService.physicalEntity.count({
          where: { userId: { not: null }, uri: null, UpvsIdentityByUri: { none: {} } },
        })
      const currentOffset = config.offset
      const newOffset = (currentOffset + 90) % physicalEntitiesWithoutUriVerificationAttemptsCount
      this.logger.log(
        `Attempt to set new offset: ${newOffset}, previous offset: ${currentOffset}, untestedEntitiesCount: ${physicalEntitiesWithoutUriVerificationAttemptsCount}`
      )
      await this.prismaService.$transaction(async (tx) => {
        const { value } = (await tx.config.findUnique({
          where: { key: EDESK_COGNITO_CONFIG_DB_KEY },
        })) as Config // Existence in db is checked at the start of the function
        const validatedValue = ValidateEdeskConfigValueSchema.parse(value)
        await tx.config.update({
          where: { key: EDESK_COGNITO_CONFIG_DB_KEY },
          data: { value: { ...validatedValue, offset: newOffset } },
        })
      })
      this.logger.log(`New offset set: ${newOffset}`)
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  @HandleErrors('Cron Error')
  async validateEdeskFromRfoData(): Promise<void> {
    const configDbResult = await this.prismaService.config.findUnique({
      where: { key: EDESK_RFO_CONFIG_DB_KEY },
    })
    if (!configDbResult) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `${EDESK_RFO_CONFIG_DB_KEY} not found in database config.`
      )
    }

    const config = ValidateEdeskConfigValueSchema.parse(configDbResult.value)
    if (!config.active) {
      return
    }
    this.logger.log(
      `${EDESK_RFO_CONFIG_DB_KEY} turned ON, starting, current offset: ${config.offset}`
    )

    const entityFromDb = await this.prismaService.physicalEntity.findMany({
      // TODO in case we'd want to make sure users are first validated through cognito, replace with the line below
      // where: { userId: { not: null }, uri: null, UpvsIdentityByUri: { some: {} } },
      where: { userId: { not: null }, uri: null },
      take: 1,
      skip: config.offset,
    })
    if (entityFromDb.length === 0) {
      this.logger.log(`No entities found for offset ${config.offset}, resetting offset`)
      await this.prismaService.config.update({
        where: { key: EDESK_RFO_CONFIG_DB_KEY },
        data: { value: { ...config, offset: 0 } },
      })
      return
    }
    const entityToValidate = entityFromDb[0]

    try {
      const result = await this.physicalEntityService.updateFromRFO(entityToValidate.id)

      // if uri was set successfully, we don't need to move the offset, otherwise we do it to skip this entity in next attempt
      if (result.physicalEntity.uri) {
        return
      }
    } catch (error) {
      this.logger.error(
        `Failed to validate entity with id: ${entityToValidate.id}, skipping`,
        error
      )
    }

    const newOffset = config.offset + 1
    this.logger.log(`Attempt to set new offset: ${newOffset}`)
    await this.prismaService.$transaction(async (tx) => {
      const { value } = (await tx.config.findUnique({
        where: { key: EDESK_RFO_CONFIG_DB_KEY },
      })) as Config // Existence in db is checked at the start of the function
      const validatedValue = ValidateEdeskConfigValueSchema.parse(value)
      // if offset was moved in between abort
      if (validatedValue.offset !== config.offset) {
        this.logger.warn(
          `Offset was moved in between ${EDESK_RFO_CONFIG_DB_KEY} calls, previous: ${config.offset}, current ${validatedValue.offset}, aborting`
        )
        return
      }
      await tx.config.update({
        where: { key: EDESK_RFO_CONFIG_DB_KEY },
        data: { value: { ...validatedValue, offset: newOffset } },
      })
    })
    this.logger.log(`New offset set: ${newOffset}`)
  }

  // even though this is a cron job, it only runs once at 3am (gmt+2) then it deactivates itself
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async syncCognitoToDb(): Promise<void> {
    const configDbResult = await this.prismaService.config.findUnique({
      where: { key: COGNITO_SYNC_CONFIG_DB_KEY },
    })
    if (!configDbResult) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `${COGNITO_SYNC_CONFIG_DB_KEY} not found in database config.`
      )
    }
    const config = SyncCognitoToDbConfigValueSchema.parse(configDbResult.value)
    if (!config.active) {
      return
    }
    this.logger.log(`${COGNITO_SYNC_CONFIG_DB_KEY} turned ON, starting`)

    const result = await this.adminService.syncCognitoToDb()

    this.logger.log(`${COGNITO_SYNC_CONFIG_DB_KEY} done: ${result}`)

    await this.prismaService.config.update({
      where: { key: COGNITO_SYNC_CONFIG_DB_KEY },
      data: { value: { active: false } },
    })
  }
}
