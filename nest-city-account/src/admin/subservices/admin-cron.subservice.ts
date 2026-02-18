/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AdminService } from 'src/admin/admin.service'
import { PhysicalEntityService } from 'src/physical-entity/physical-entity.service'
import * as z from 'zod'
import { PrismaService } from '../../prisma/prisma.service'
import HandleErrors from '../../utils/decorators/errorHandler.decorators'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import { COGNITO_SYNC_CONFIG_DB_KEY } from '../utils/constants'

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

  // even though this is a cron job, it only runs once then it deactivates itself,
  // expression EVERY_DAY_AT_1AM runs at 3AM in gmt+2 timezone and 2AM (gmt+1) in winter
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

    try {
      await this.adminService.syncCognitoToDb()
      this.logger.log(`syncCognitoToDb successfull, change ${COGNITO_SYNC_CONFIG_DB_KEY} to false.`)
    } catch (error) {
      this.logger.error(error)
      this.logger.log(
        `syncCognitoToDb unsuccessfull, change ${COGNITO_SYNC_CONFIG_DB_KEY} to false.`
      )
    }

    await this.prismaService.config.update({
      where: { key: COGNITO_SYNC_CONFIG_DB_KEY },
      data: { value: { active: false } },
    })
  }
}
