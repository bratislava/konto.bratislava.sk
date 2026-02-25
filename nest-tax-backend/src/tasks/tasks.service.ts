import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DeliveryMethodNamed, PaymentStatus } from '@prisma/client'
import dayjs from 'dayjs'
import pLimit from 'p-limit'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { PaymentService } from '../payment/payment.service'
import { PrismaService } from '../prisma/prisma.service'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../tax/dtos/error.dto'
import { stateHolidays } from '../tax/utils/unified-tax.util'
import HandleErrors from '../utils/decorators/errorHandler.decorator'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { TaxPaymentWithTaxAndTaxPayer } from '../utils/types/types.prisma'
import { NorisSyncTasksService } from './subservices/noris-sync.tasks.service'
import { ReportingTasksService } from './subservices/reporting.tasks.service'
import { TaxImportOrchestratorTasksService } from './subservices/tax-import-orchestrator.tasks.service'
import { CityAccountIngestionTasksService } from './subservices/city-account-ingestion.tasks.service'

@Injectable()
export class TasksService {
  private readonly logger: Logger

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly bloomreachService: BloomreachService,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly reporting: ReportingTasksService,
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

  @Cron(CronExpression.EVERY_WEEKDAY)
  @HandleErrors('Cron Error')
  async reportCardPayments() {
    await this.reporting.reportCardPayments()
  }

  // need to spread this because of getUserDataAdminBatch will timeout if used on 700 records
  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async sendUnpaidTaxReminders() {
    await this.bloomreachMessagingTasksService.sendUnpaidTaxReminders()
  }

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

  @Cron(CronExpression.EVERY_30_SECONDS)
  @HandleErrors('Cron Error')
  async loadNewUsersFromCityAccount() {
    await this.cityAccountIngestionTasksService.loadNewUsersFromCityAccount()
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

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async loadOverpaymentsFromNoris() {
    await this.norisSyncTasksService.loadOverpaymentsFromNoris()
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resendBloomreachEvents() {
    this.logger.log('Starting resendBloomreachEvents task')
    const payments = await this.prismaService.taxPayment.findMany({
      where: {
        status: PaymentStatus.SUCCESS,
        bloomreachEventSent: false,
      },
      include: {
        tax: {
          include: {
            taxPayer: true,
          },
        },
      },
    })

    if (payments.length === 0) {
      this.logger.log('No payments to resend bloomreach events for')
      return
    }

    const concurrency = Number(process.env.DB_CONCURRENCY ?? 10)
    const concurrencyLimit = pLimit(concurrency)

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        payments.map((payment) => payment.tax.taxPayer.birthNumber),
      )

    const trackPaymentWithConcurrencyLimit = async (
      payment: TaxPaymentWithTaxAndTaxPayer,
    ): Promise<boolean> => {
      try {
        await concurrencyLimit(async () => {
          const userFromCityAccount =
            userDataFromCityAccount[payment.tax.taxPayer.birthNumber] || null
          await this.paymentService.trackPaymentInBloomreach(
            payment,
            userFromCityAccount?.externalId ?? undefined,
          )
        })
        return true
      } catch (error) {
        // Throwing would cause the whole task to fail, so we just log the error
        this.logger.error(error)
        return false
      }
    }

    const results = await Promise.all(
      payments.map(async (payment) => {
        const success = await trackPaymentWithConcurrencyLimit(payment)
        return success
      }),
    )

    this.logger.log(
      `TasksService: Resent ${results.filter(Boolean).length} bloomreach payment events. Failed to resend ${results.filter((result) => !result).length} bloomreach payment events.`,
    )
  }
}
