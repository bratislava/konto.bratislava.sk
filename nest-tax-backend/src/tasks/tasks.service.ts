import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import dayjs from 'dayjs'

import { PrismaService } from '../prisma/prisma.service'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../tax/dtos/error.dto'
import { stateHolidays } from '../tax/utils/unified-tax.util'
import { NORIS_SILENT_CONNECTION_ERRORS_KEY } from '../utils/constants'
import HandleErrors from '../utils/decorators/errorHandler.decorator'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import DatabaseSubservice from '../utils/subservices/database.subservice'
import CityAccountIngestionTasksService from './subservices/city-account-ingestion.tasks.service'
import NorisSyncTasksService from './subservices/noris-sync.tasks.service'
import NotificationsEventsService from './subservices/notifications-events.service'
import ReportingTasksService from './subservices/reporting.tasks.service'
import TaxImportTasksService from './subservices/tax-import.tasks.service'

const NORIS_SILENT_CONNECTION_ERRORS_THRESHOLD = 20

@Injectable()
export class TasksService {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly configService: ConfigService,
    private readonly notificationsEventsService: NotificationsEventsService,
    private readonly reportingTasksService: ReportingTasksService,
    private readonly norisSyncTasksService: NorisSyncTasksService,
    private readonly cityAccountIngestionTasksService: CityAccountIngestionTasksService,
    private readonly taxImportTasksService: TaxImportTasksService,
    private readonly databaseSubservice: DatabaseSubservice,
    private readonly prismaService: PrismaService,
  ) {
    this.configService.getOrThrow<string>(
      'FEATURE_TOGGLE_UPDATE_TAXES_FROM_NORIS',
    )
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async updatePaymentsFromNoris() {
    await this.norisSyncTasksService.updatePaymentsFromNoris()
  }

  @Cron('*/3 * * * *')
  @HandleErrors('Cron Error')
  async updateTaxesFromNoris() {
    await this.norisSyncTasksService.updateTaxesFromNoris()
  }

  @Cron(CronExpression.EVERY_WEEKDAY)
  @HandleErrors('Cron Error')
  async reportCardPayments() {
    await this.reportingTasksService.reportCardPayments()
  }

  // need to spread this because of getUserDataAdminBatch will timeout if used on 700 records
  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async sendUnpaidTaxReminders() {
    await this.notificationsEventsService.sendUnpaidTaxReminders()
  }

  @Cron('*/10 7-20 * * *') // every 10 minutes between 7:00 and 20:00
  @HandleErrors('Cron Error')
  async sendUnpaidTaxInstallmentReminders() {
    await this.notificationsEventsService.sendUnpaidTaxInstallmentReminders()
  }

  @Cron('0 9-17 1-23 12 1-5')
  @HandleErrors('Cron Error')
  sendAlertsIfHolidaysAreNotSet() {
    const nextYear = dayjs().year() + 1

    const stateHolidaysForNextYear = Boolean(stateHolidays[nextYear])

    if (!stateHolidaysForNextYear) {
      this.throwerErrorGuard.InternalServerErrorException(
        CustomErrorTaxTypesEnum.STATE_HOLIDAY_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.STATE_HOLIDAY_NOT_EXISTS,
        undefined,
        'Please fill in the state holidays for the next year in the `src/tax/utils/unified-tax.utils.ts`. The holidays are used to calculate taxes.',
      )
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  @HandleErrors('Cron Error')
  async loadNewUsersFromCityAccount() {
    await this.cityAccountIngestionTasksService.loadNewUsersFromCityAccount()
  }

  @Cron('*/3 * * * *')
  @HandleErrors('Cron Error')
  async loadTaxesForUsers() {
    await this.taxImportTasksService.loadTaxesForUsers()
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async loadHistoricalTaxes() {
    await this.taxImportTasksService.loadHistoricalTaxes()
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async loadOverpaymentsFromNoris() {
    await this.taxImportTasksService.loadOverpaymentsFromNoris()
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  @HandleErrors('Cron Error')
  async resendBloomreachEvents() {
    await this.notificationsEventsService.resendBloomreachEvents()
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM, { timeZone: 'Europe/Bratislava' })
  @HandleErrors('Cron Error')
  async alertSilentNorisConnectionErrors() {
    const numberOfErrorsValue = await this.databaseSubservice.getConfigByKeys([
      NORIS_SILENT_CONNECTION_ERRORS_KEY,
    ])
    const numberOfErrors = Number(
      numberOfErrorsValue[NORIS_SILENT_CONNECTION_ERRORS_KEY],
    )

    if (Number.isNaN(numberOfErrors)) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Invalid ${NORIS_SILENT_CONNECTION_ERRORS_KEY} value: ${numberOfErrorsValue[NORIS_SILENT_CONNECTION_ERRORS_KEY]}. Must be a number.`,
      )
    }

    await this.prismaService.config.updateMany({
      where: {
        key: NORIS_SILENT_CONNECTION_ERRORS_KEY,
      },
      data: {
        value: '0',
      },
    })

    if (numberOfErrors < NORIS_SILENT_CONNECTION_ERRORS_THRESHOLD) {
      return
    }

    throw this.throwerErrorGuard.InternalServerErrorException(
      ErrorsEnum.INTERNAL_SERVER_ERROR,
      `Number of silenced Noris connection errors in last 24 hours is ${numberOfErrors}.`,
    )
  }
}
