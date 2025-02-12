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

const ValidateEdeskConfigValueSchema = z.object({
  active: z.boolean(),
  offset: z.number(),
})

@Injectable()
export class AdminCronSubservice {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(AdminCronSubservice.name)

  private readonly edeskCognitoConfigDbkey = 'VALIDATE_EDESK_FROM_COGNITO_DATA'

  private readonly edeskRfoConfigDbkey = 'VALIDATE_EDESK_FROM_RFO_DATA'

  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminService: AdminService,
    private readonly physicalEntityService: PhysicalEntityService
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  @HandleErrors('Cron Error')
  async validateEdeskFromCognitoData(): Promise<void> {
    const configDbResult = await this.prismaService.config.findUnique({
      where: { key: this.edeskCognitoConfigDbkey },
    })
    if (!configDbResult) {
      throw new Error('VALIDATE_EDESK_FROM_COGNITO_DATA not found in database config.')
    }

    const config = ValidateEdeskConfigValueSchema.parse(configDbResult.value)
    if (!config.active) {
      return
    }
    this.logger.log(
      `${this.edeskCognitoConfigDbkey} turned ON, starting, current offset: ${config.offset}`
    )

    const result = await this.adminService.validateEdeskWithUriFromCognito(config.offset)
    const validatedUsers = result.validatedUsers
    const mappingFn = (
      upvsResult: UpvsIdentityByUri | { physicalEntityId?: string; uri: string }
    ) => `uri: ${upvsResult.uri} physicalEntityId: ${upvsResult.physicalEntityId}`
    const successData = result.entities.success.map(mappingFn)
    const failedData = result.entities.failed.map(mappingFn)
    this.logger.log(
      `${this.edeskCognitoConfigDbkey} done: validatedUsers: ${validatedUsers} successData: ${successData} failedData: ${failedData}`
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
        const { value } = await tx.config.findUnique({
          where: { key: this.edeskCognitoConfigDbkey },
        }) as Config // Existence in db is checked at the start of the function
        const validatedValue = ValidateEdeskConfigValueSchema.parse(value)
        await tx.config.update({
          where: { key: this.edeskCognitoConfigDbkey },
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
      where: { key: this.edeskRfoConfigDbkey },
    })
    if (!configDbResult) {
      throw new Error('VALIDATE_EDESK_FROM_RFO_DATA not found in database config.')
    }

    const config = ValidateEdeskConfigValueSchema.parse(configDbResult.value)
    if (!config.active) {
      return
    }
    this.logger.log(
      `${this.edeskRfoConfigDbkey} turned ON, starting, current offset: ${config.offset}`
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
        where: { key: this.edeskRfoConfigDbkey },
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
      this.logger.error(error)
      this.logger.error(`Failed to validate entity with id: ${entityToValidate.id}, skipping`)
    }

    const newOffset = config.offset + 1
    this.logger.log(`Attempt to set new offset: ${newOffset}`)
    await this.prismaService.$transaction(async (tx) => {
      const { value } = await tx.config.findUnique({
        where: { key: this.edeskRfoConfigDbkey },
      }) as Config // Existence in db is checked at the start of the function
      const validatedValue = ValidateEdeskConfigValueSchema.parse(value)
      // if offset was moved in between abort
      if (validatedValue.offset !== config.offset) {
        this.logger.warn(
          `Offset was moved in between ${this.edeskRfoConfigDbkey} calls, previous: ${config.offset}, current ${validatedValue.offset}, aborting`
        )
        return
      }
      await tx.config.update({
        where: { key: this.edeskRfoConfigDbkey },
        data: { value: { ...validatedValue, offset: newOffset } },
      })
    })
    this.logger.log(`New offset set: ${newOffset}`)
  }
}
