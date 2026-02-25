import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import dayjs from 'dayjs'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../tax/dtos/error.dto'
import { stateHolidays } from '../tax/utils/unified-tax.util'
import HandleErrors from '../utils/decorators/errorHandler.decorator'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { BloomreachMessagingTasksService } from './subservices/bloomreach-messaging.tasks.service'
import { CityAccountIngestionTasksService } from './subservices/city-account-ingestion.tasks.service'
import { NorisSyncTasksService } from './subservices/noris-sync.tasks.service'
import { ReportingTasksService } from './subservices/reporting.tasks.service'
import { TaxImportOrchestratorTasksService } from './subservices/tax-import-orchestrator.tasks.service'

@Injectable()
export class TasksService {
  private readonly logger: Logger

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly configService: ConfigService,
    private readonly reportingTasksService: ReportingTasksService,
    private readonly norisSyncTasksService: NorisSyncTasksService,
    private readonly taxImportOrchestratorTasksService: TaxImportOrchestratorTasksService,
    private readonly cityAccountIngestionTasksService: CityAccountIngestionTasksService,
    private readonly bloomreachMessagingTasksService: BloomreachMessagingTasksService,
  ) {
    this.logger = new Logger(TasksService.name)
    // Check if the required environment variable is set
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

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async loadOverpaymentsFromNoris() {
    await this.norisSyncTasksService.loadOverpaymentsFromNoris()
  }

  @Cron('*/3 * * * *')
  @HandleErrors('Cron Error')
  async loadTaxesForUsers() {
    await this.taxImportOrchestratorTasksService.loadTaxesForUsers()
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async loadHistoricalTaxesForExistingUsers() {
    await this.taxImportOrchestratorTasksService.loadHistoricalTaxesForExistingUsers()
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  @HandleErrors('Cron Error')
  async loadNewUsersFromCityAccount() {
    await this.cityAccountIngestionTasksService.loadNewUsersFromCityAccount()
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async sendUnpaidTaxReminders() {
    await this.bloomreachMessagingTasksService.sendUnpaidTaxReminders()
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resendBloomreachEvents() {
    await this.bloomreachMessagingTasksService.resendBloomreachEvents()
  }

  @Cron(CronExpression.EVERY_WEEKDAY)
  @HandleErrors('Cron Error')
  async reportCardPayments() {
    await this.reportingTasksService.reportCardPayments()
  }

  // need to spread this because of getUserDataAdminBatch will time out if used on 700 records

  @Cron('0 9-17 1-23 12 1-5')
  @HandleErrors('Cron Error')
  async sendAlertsIfHolidaysAreNotSet() {
    const nextYear = dayjs().year() + 1

    const stateHolidaysForNextYear = !!stateHolidays[nextYear]

    if (!stateHolidaysForNextYear) {
      this.throwerErrorGuard.InternalServerErrorException(
        CustomErrorTaxTypesEnum.STATE_HOLIDAY_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.STATE_HOLIDAY_NOT_EXISTS,
        undefined,
        'Please fill in the state holidays for the next year in the `src/tax/utils/unified-tax.utils.ts`. The holidays are used to calculate taxes.',
      )
    }
  }
}
