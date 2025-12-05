import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  DeliveryMethodNamed,
  PaymentStatus,
  Prisma,
  TaxType,
} from '@prisma/client'
import dayjs from 'dayjs'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { CardPaymentReportingService } from '../card-payment-reporting/card-payment-reporting.service'
import { CustomErrorNorisTypesEnum } from '../noris/noris.errors'
import { NorisService } from '../noris/noris.service'
import { NorisTaxPayment } from '../noris/types/noris.types'
import { PrismaService } from '../prisma/prisma.service'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../tax/dtos/error.dto'
import { stateHolidays } from '../tax/utils/unified-tax.util'
import {
  MAX_NORIS_PAYMENTS_BATCH_SELECT,
  MAX_NORIS_TAXES_TO_UPDATE,
  OVERPAYMENTS_LOOKBACK_DAYS,
} from '../utils/constants'
import HandleErrors from '../utils/decorators/errorHandler.decorator'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { toLogfmt } from '../utils/logging'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../utils/subservices/database.subservice'
import TasksConfigSubservice from './subservices/config.subservice'
import TaxImportHelperSubservice from './subservices/tax-import-helper.subservice'

const LOAD_USER_BIRTHNUMBERS_BATCH = 100

@Injectable()
export class TasksService {
  private readonly logger: Logger

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly cardPaymentReportingService: CardPaymentReportingService,
    private readonly bloomreachService: BloomreachService,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly databaseSubservice: DatabaseSubservice,
    private readonly configSubservice: TasksConfigSubservice,
    private readonly taxImportHelperSubservice: TaxImportHelperSubservice,
    private readonly norisService: NorisService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger('TasksService')
    // Check if the required environment variable is set
    this.configService.getOrThrow<string>(
      'FEATURE_TOGGLE_UPDATE_TAXES_FROM_NORIS',
    )
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async updatePaymentsFromNoris() {
    let variableSymbolsDb: {
      variableSymbol: string
      id: number
      year: number
    }[] = []

    // non-production environment is used for testing and we create taxes from endpoint `create-testing-tax`,
    // this function will overwrite the testing taxes payments which is not desired
    if (
      this.configService.getOrThrow<string>(
        'FEATURE_TOGGLE_UPDATE_TAXES_FROM_NORIS',
      ) !== 'true'
    ) {
      this.logger.log(`TasksService: Updating taxes from Noris disabled.`)
      return
    }
    try {
      variableSymbolsDb = await this.prismaService.$transaction(
        async (prisma) => {
          await prisma.$executeRaw`SET LOCAL statement_timeout = '120000'`

          return prisma.$queryRaw<
            { variableSymbol: string; id: number; year: number }[]
          >`
          SELECT t."variableSymbol", t."id", t."year"
          FROM "Tax" t
          LEFT JOIN "TaxPayment" tp ON t."id" = tp."taxId" AND tp.status = 'SUCCESS'
          GROUP BY t."id", t."variableSymbol", t."lastCheckedPayments"
          HAVING COALESCE(SUM(tp."amount"), 0) < t."amount"
          ORDER BY t."lastCheckedPayments" ASC
          LIMIT ${MAX_NORIS_PAYMENTS_BATCH_SELECT}
        `
        },
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.meta?.code === '57014'
      ) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Query timed out after 2 minutes',
          undefined,
          undefined,
          error,
        )
      }
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        undefined,
        undefined,
        error,
      )
    }

    if (variableSymbolsDb.length === 0) return

    const data = {
      variableSymbols: variableSymbolsDb.map(
        (variableSymbolDb) => variableSymbolDb.variableSymbol,
      ),
      years: [
        ...new Set(
          variableSymbolsDb.map((variableSymbolDb) => variableSymbolDb.year),
        ),
      ],
    }

    this.logger.log(
      `TasksService: Updating payments from Noris with data: ${JSON.stringify(data)}`,
    )

    let result: {
      created: number
      alreadyCreated: number
    }
    try {
      const norisPaymentData: NorisTaxPayment[] =
        await this.norisService.getPaymentDataFromNorisByVariableSymbols(data)
      result =
        await this.norisService.updatePaymentsFromNorisWithData(
          norisPaymentData,
        )
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        CustomErrorNorisTypesEnum.UPDATE_PAYMENTS_FROM_NORIS_ERROR,
        'Failed to update payments from Noris',
        undefined,
        undefined,
        error,
      )
    }

    await this.prismaService.tax.updateMany({
      where: {
        id: {
          in: variableSymbolsDb.map((dbRecord) => dbRecord.id),
        },
      },
      data: {
        lastCheckedPayments: new Date(),
      },
    })

    this.logger.log(
      `TasksService: Updated payments from Noris, result: ${JSON.stringify(result)}`,
    )
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async updateRealEstateTaxesFromNoris() {
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

    const currentYear = new Date().getFullYear()
    const taxes = await this.prismaService.tax.findMany({
      select: {
        id: true,
        taxPayer: {
          select: {
            birthNumber: true,
          },
        },
      },
      where: {
        year: currentYear,
        type: TaxType.DZN,
      },
      take: MAX_NORIS_TAXES_TO_UPDATE,
      orderBy: {
        lastCheckedUpdates: 'asc',
      },
    })

    if (taxes.length === 0) {
      return
    }

    this.logger.log(
      `TasksService: Updating taxes from Noris with ids: ${taxes.map((t) => t.id).join(', ')}`,
    )

    const { updated } =
      await this.norisService.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
        TaxType.DZN,
        currentYear,
        taxes.map((t) => t.taxPayer.birthNumber),
      )

    this.logger.log(`TasksService: Updated ${updated} DZN taxes from Noris`)

    await this.prismaService.tax.updateMany({
      where: {
        id: {
          in: taxes.map((t) => t.id),
        },
      },
      data: {
        lastCheckedUpdates: new Date(),
      },
    })
  }

  @Cron(CronExpression.EVERY_WEEKDAY)
  @HandleErrors('Cron Error')
  async reportCardPayments() {
    const config = await this.databaseSubservice.getConfigByKeys([
      'REPORTING_GENERATE_REPORT',
      'REPORTING_RECIPIENT_EMAIL',
    ])

    if (!config.REPORTING_GENERATE_REPORT) {
      return
    }

    const emailRecipients = config.REPORTING_RECIPIENT_EMAIL.split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0)

    await this.cardPaymentReportingService.generateAndSendPaymentReport(
      emailRecipients,
    )
  }

  // need to spread this because of getUserDataAdminBatch will timeout if used on 700 records
  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async sendUnpaidTaxReminders() {
    const FIFTEEN_DAYS_AGO = dayjs().subtract(15, 'day').toDate()
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
        taxPayments: {
          none: {
            status: PaymentStatus.SUCCESS,
          },
        },
        OR: [
          {
            deliveryMethod: DeliveryMethodNamed.CITY_ACCOUNT,
            createdAt: {
              lte: FIFTEEN_DAYS_AGO,
            },
          },
          {
            deliveryMethod: {
              not: DeliveryMethodNamed.CITY_ACCOUNT,
            },
            dateTaxRuling: {
              lte: FIFTEEN_DAYS_AGO,
            },
          },
          {
            deliveryMethod: null,
            dateTaxRuling: {
              lte: FIFTEEN_DAYS_AGO,
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
            { year: tax.year, taxType: tax.type, order: tax.order! },
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

  @Cron('0 9-17 1-23 12 1-5')
  @HandleErrors('Cron Error')
  async sendAlertsIfHolidaysAreNotSet() {
    const nextYear = dayjs().year() + 1

    const stateHolidaysForNextYear = stateHolidays.some(
      (entry) => entry.year === nextYear,
    )

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
    // Get latest date from config
    const config = await this.databaseSubservice.getConfigByKeys([
      'LOADING_NEW_USERS_FROM_CITY_ACCOUNT',
    ])

    const since = new Date(config.LOADING_NEW_USERS_FROM_CITY_ACCOUNT)
    // Get birth numbers from nest-city account

    const data =
      await this.cityAccountSubservice.getNewUserBirtNumbersAdminBatch(
        since,
        LOAD_USER_BIRTHNUMBERS_BATCH,
      )

    // Create TaxPayers in database by birthumber if they do not exist. Only value set should be birth number
    await this.prismaService.taxPayer.createMany({
      data: data.birthNumbers.map((bn) => {
        return { birthNumber: bn }
      }),
      skipDuplicates: true,
    })

    const latestRecord = await this.prismaService.config.findFirst({
      where: {
        key: 'LOADING_NEW_USERS_FROM_CITY_ACCOUNT',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    if (latestRecord) {
      await this.prismaService.config.update({
        where: {
          id: latestRecord.id,
        },
        data: {
          value: data.nextSince.toISOString(),
        },
      })
    } else {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        // eslint-disable-next-line no-secrets/no-secrets
        'Database used to contain `LOADING_NEW_USERS_FROM_CITY_ACCOUNT` key in Config table at the start of this task, but it no longer exists. This really should not happen.',
        undefined,
        `New \`nextSince\` was supposed to be set: ${data.nextSince.toISOString()}`,
      )
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  @HandleErrors('Cron Error')
  async loadRealEstateTaxesForUsers() {
    this.logger.log('Starting loadRealEstateTaxesForUsers task')

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
        TaxType.DZN,
        year,
        importPhase,
      )

    // Import newly created users regardless of window or limit
    if (newlyCreated.length > 0) {
      this.logger.log(
        `Found ${newlyCreated.length} newly created users, importing immediately`,
      )
      await this.taxImportHelperSubservice.importTaxes(
        TaxType.DZN,
        newlyCreated,
        year,
      )
    }

    if (birthNumbers.length > 0) {
      await (importPhase
        ? this.taxImportHelperSubservice.importTaxes(
            TaxType.DZN,
            birthNumbers,
            year,
          )
        : this.taxImportHelperSubservice.prepareTaxes(
            TaxType.DZN,
            birthNumbers,
            year,
          ))
    }
  }

  private async retryWithDelay<T>(
    fn: () => Promise<T>,
    retries = 3,
    delayMs = 5 * 60 * 1000, // 5 minutes
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries <= 0) {
        throw error
      }
      this.logger.warn(
        `Retry attempt failed. Retrying in ${(delayMs / 1000).toFixed(2)} seconds. Remaining retries: ${retries - 1}`,
        toLogfmt(error),
      )
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs)
      })
      return this.retryWithDelay(fn, retries - 1, delayMs)
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async loadOverpaymentsFromNoris() {
    const config = await this.databaseSubservice.getConfigByKeys([
      'OVERPAYMENTS_FROM_NORIS_ENABLED',
      OVERPAYMENTS_LOOKBACK_DAYS,
    ])

    if (config.OVERPAYMENTS_FROM_NORIS_ENABLED !== 'true') {
      this.logger.log('Overpayments from Noris are not enabled. Skipping task.')
      return
    }

    this.logger.log('Starting loadOverpaymentsFromNoris task')

    // Parse the lookback days from config, throw error if invalid
    const lookbackDays = parseInt(config.OVERPAYMENTS_LOOKBACK_DAYS, 10)
    if (Number.isNaN(lookbackDays) || lookbackDays <= 0) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Invalid OVERPAYMENTS_LOOKBACK_DAYS configuration: ${config.OVERPAYMENTS_LOOKBACK_DAYS}. Must be a positive integer.`,
      )
    }

    this.logger.log(
      `Using ${lookbackDays} days lookback period for overpayments`,
    )

    const fromDate = dayjs().subtract(lookbackDays, 'day').toDate()
    const data = {
      fromDate,
    }

    this.logger.log(
      `TasksService: Loading overpayments from Noris with data: ${JSON.stringify(data)}`,
    )

    let result: {
      created: number
      alreadyCreated: number
    }
    try {
      result = await this.retryWithDelay(async () => {
        return this.norisService.updateOverpaymentsDataFromNorisByDateRange(
          data,
        )
      })

      // Success: reset lookback days to default
      await this.configSubservice.resetOverpaymentsLookbackDays()
      this.logger.log(
        `TasksService: Loaded overpayments from Noris successfully, result: ${JSON.stringify(result)}`,
      )
    } catch (error) {
      // Failure: increment lookback days for next run
      await this.configSubservice.incrementOverpaymentsLookbackDays()
      throw this.throwerErrorGuard.InternalServerErrorException(
        CustomErrorNorisTypesEnum.LOAD_OVERPAYMENTS_FROM_NORIS_ERROR,
        'Failed to load overpayments from Noris after all retry attempts',
        undefined,
        undefined,
        error,
      )
    }
  }
}
