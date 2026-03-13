import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import dayjs from 'dayjs'

import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../tax/dtos/error.dto'
import { DUE_DATE_OFFSET, stateHolidays } from '../tax/utils/unified-tax.util'
import { getTaxDefinitionByType } from '../tax-definitions/getTaxDefinitionByType'
import { MAX_NORIS_TAXES_TO_UPDATE } from '../utils/constants'
import HandleErrors from '../utils/decorators/errorHandler.decorator'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { RetryService } from '../utils-module/retry.service'
import NotificationsEventsSubservice from './subservices/notifications-events.subservice'
import { getNextTaxType } from './utils/tax-type-switch'

import BloomreachMessagingTasksService from './subservices/bloomreach-messaging.tasks.service'
import CityAccountIngestionTasksService from './subservices/city-account-ingestion.tasks.service'
import NorisSyncTasksService from './subservices/noris-sync.tasks.service'
import ReportingTasksService from './subservices/reporting.tasks.service'
import TaxImportTasksService from './subservices/tax-import.tasks.service'

@Injectable()
export class TasksService {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly configService: ConfigService,
    private readonly notificationsEventsSubservice: NotificationsEventsSubservice,
    private readonly reportingTasksService: ReportingTasksService,
    private readonly norisSyncTasksService: NorisSyncTasksService,
    private readonly cityAccountIngestionTasksService: CityAccountIngestionTasksService,
    private readonly bloomreachMessagingTasksService: BloomreachMessagingTasksService,
    private readonly taxImportTasksService: TaxImportTasksService,
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
    // non-production environment is used for testing and we create taxes from endpoint `create-testing-tax`,
    // this process "updateTaxesFromNoris" will overwrite the testing taxes which is not desired
    if (
      this.configService.getOrThrow<string>(
        'FEATURE_TOGGLE_UPDATE_TAXES_FROM_NORIS',
      ) !== 'true'
    ) {
      this.logger.log(`TasksService: Updating taxes from Noris disabled.`)
      return
    }

    this.lastUpdateTaxType = getNextTaxType(this.lastUpdateTaxType)

    await this.updateTaxesFromNorisByTaxType(this.lastUpdateTaxType)
  }

  private async updateTaxesFromNorisByTaxType(taxType: TaxType) {
    const currentYear = new Date().getFullYear()
    const { lastUpdatedAtDatabaseFieldName } = getTaxDefinitionByType(taxType)

    const taxPayers = await this.prismaService.taxPayer.findMany({
      select: {
        id: true,
        birthNumber: true,
      },
      where: {
        taxes: {
          some: {
            year: currentYear,
            type: taxType,
          },
        },
      },
      orderBy: {
        [lastUpdatedAtDatabaseFieldName]: 'asc',
      },
      take: MAX_NORIS_TAXES_TO_UPDATE,
    })

    if (taxPayers.length === 0) {
      return
    }

    this.logger.log(
      `TasksService: Updating taxes from Noris for tax payers with birth numbers: ${taxPayers.map((t) => t.birthNumber).join(', ')}, tax type: ${taxType}, current year: ${currentYear}`,
    )

    const { updated } =
      await this.norisService.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
        taxType,
        currentYear,
        taxPayers.map((t) => t.birthNumber),
      )

    this.logger.log(
      `TasksService: Updated ${updated} ${taxType} taxes from Noris`,
    )

    await this.prismaService.taxPayer.updateMany({
      where: {
        id: {
          in: taxPayers.map((t) => t.id),
        },
      },
      data: {
        [lastUpdatedAtDatabaseFieldName]: new Date(),
      },
    })
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
    const DUE_DATE_OFFSET_DATE = dayjs()
      .tz('Europe/Bratislava')
      .subtract(DUE_DATE_OFFSET, 'day')
      .toDate()
    const taxes = await this.prismaService.tax.findMany({
      select: {
        id: true,
        year: true,
        type: true,
        order: true,
        taxPayer: {
          select: {
            birthNumber: true,
          },
        },
      },
      where: {
        bloomreachUnpaidTaxReminderSent: false,
        isCancelled: false,
        taxPayments: {
          none: {
            status: PaymentStatus.SUCCESS,
          },
        },
        OR: [
          {
            deliveryMethod: DeliveryMethodNamed.CITY_ACCOUNT,
            createdAt: {
              lte: DUE_DATE_OFFSET_DATE,
            },
          },
          {
            deliveryMethod: {
              not: DeliveryMethodNamed.CITY_ACCOUNT,
            },
            dateTaxRuling: {
              lte: DUE_DATE_OFFSET_DATE,
            },
          },
          {
            deliveryMethod: null,
            dateTaxRuling: {
              lte: DUE_DATE_OFFSET_DATE,
            },
          },
        ],
      },
      // need to spread this because of getUserDataAdminBatch will timeout if used on 700 records
      // 50 * 6 * 24 h = 7200 is max number of konto visitors in dayhours
      take: 50,
    })

    if (taxes.length === 0) {
      return
    }
    this.logger.log(
      `TasksService: Sending unpaid tax reminder events for taxes: ${JSON.stringify(
        taxes.map((tax) => ({
          id: tax.id,
        })),
      )}`,
    )

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        taxes.map((taxData) => taxData.taxPayer.birthNumber),
      )

    await Promise.all(
      taxes.map(async (tax) => {
        const userFromCityAccount =
          userDataFromCityAccount[tax.taxPayer.birthNumber] || null
        if (userFromCityAccount && userFromCityAccount.externalId) {
          await this.bloomreachService.trackEventUnpaidTaxReminder(
            { year: tax.year, tax_type: tax.type, order: tax.order! },
            userFromCityAccount.externalId,
          )
        }
      }),
    )

    await this.prismaService.tax.updateMany({
      where: {
        id: {
          in: taxes.map((tax) => tax.id),
        },
      },
      data: {
        bloomreachUnpaidTaxReminderSent: true,
      },
    })
  }

  @Cron('*/10 7-20 * * *') // every 10 minutes between 7:00 and 20:00
  @HandleErrors('Cron Error')
  async sendUnpaidTaxInstallmentReminders() {
    await this.notificationsEventsSubservice.sendUnpaidTaxInstallmentReminders()
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
    this.lastLoadedTaxType = getNextTaxType(this.lastLoadedTaxType)

    this.logger.log(
      `Starting LoadTaxForUsers task for TaxType: ${this.lastLoadedTaxType}`,
    )

    await this.loadTaxDataForUserByTaxType(this.lastLoadedTaxType)
  }

  private async loadTaxDataForUserByTaxType(taxType: TaxType) {
    const year = new Date().getFullYear()

    const [isWithinWindow, todayTaxCount, dailyLimit] = await Promise.all([
      this.taxImportHelperSubservice.isWithinImportWindow(),
      this.taxImportHelperSubservice.getTodayTaxCount(),
      this.taxImportHelperSubservice.getDailyTaxLimit(),
    ])
    const isLimitReached = todayTaxCount >= dailyLimit
    const importPhase = isWithinWindow && !isLimitReached

    this.logger.log(
      `Time window: ${isWithinWindow ? 'OPEN' : 'CLOSED'}, Today's tax count: ${todayTaxCount}/${dailyLimit}, Phase: ${importPhase ? 'IMPORT' : 'PREPARE'}`,
    )

    const { birthNumbers, newlyCreated } =
      await this.taxImportHelperSubservice.getPrioritizedBirthNumbersWithMetadata(
        taxType,
        year,
        importPhase,
      )

    // Import newly created users regardless of window or limit
    if (newlyCreated.length > 0) {
      this.logger.log(
        `Found ${newlyCreated.length} newly created users, importing all taxes immediately`,
      )
      await this.taxImportHelperSubservice.importTaxes(
        TaxType.DZN,
        newlyCreated,
        year,
      )
      await this.taxImportHelperSubservice.importTaxes(
        TaxType.KO,
        newlyCreated,
        year,
      )
    }

    if (birthNumbers.length > 0) {
      this.logger.log(
        `Found ${birthNumbers.length} existing users, ${importPhase ? 'importing' : 'preparing'}`,
      )
      await (importPhase
        ? this.taxImportHelperSubservice.importTaxes(
            taxType,
            birthNumbers,
            year,
          )
        : this.taxImportHelperSubservice.prepareTaxes(
            taxType,
            birthNumbers,
            year,
          ))
    }

    if (birthNumbers.length === 0 && newlyCreated.length === 0) {
      this.logger.log('No birth numbers found to import taxes')
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async loadOverpaymentsFromNoris() {
    await this.taxImportTasksService.loadOverpaymentsFromNoris()
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resendBloomreachEvents() {
    await this.bloomreachMessagingTasksService.resendBloomreachEvents()
  }
}
