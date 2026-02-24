import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  DeliveryMethodNamed,
  HistoricalTaxImportStatus,
  PaymentStatus,
  Prisma,
  TaxType,
} from '@prisma/client'
import dayjs from 'dayjs'
import pLimit from 'p-limit'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { CardPaymentReportingService } from '../card-payment-reporting/card-payment-reporting.service'
import { CustomErrorNorisTypesEnum } from '../noris/noris.errors'
import { NorisService } from '../noris/noris.service'
import { NorisTaxPayment } from '../noris/types/noris.types'
import { PaymentService } from '../payment/payment.service'
import { PrismaService } from '../prisma/prisma.service'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../tax/dtos/error.dto'
import { stateHolidays } from '../tax/utils/unified-tax.util'
import { getTaxDefinitionByType } from '../tax-definitions/getTaxDefinitionByType'
import {
  MAX_NORIS_PAYMENTS_BATCH_SELECT,
  MAX_NORIS_TAXES_TO_UPDATE,
  OVERPAYMENTS_LOOKBACK_DAYS,
} from '../utils/constants'
import HandleErrors from '../utils/decorators/errorHandler.decorator'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../utils/subservices/database.subservice'
import { TaxPaymentWithTaxAndTaxPayer } from '../utils/types/types.prisma'
import { RetryService } from '../utils-module/retry.service'
import TasksConfigSubservice from './subservices/config.subservice'
import TaxImportHelperSubservice from './subservices/tax-import-helper.subservice'

const LOAD_USER_BIRTHNUMBERS_BATCH = 100

@Injectable()
export class TasksService {
  private readonly logger: Logger

  private lastLoadedTaxType: TaxType = TaxType.DZN

  private lastUpdateTaxType: TaxType = TaxType.KO

  private FIRST_HISTORICAL_YEAR = 2020

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
    private readonly retryService: RetryService,
    private readonly paymentService: PaymentService,
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

    this.lastUpdateTaxType =
      this.lastUpdateTaxType === TaxType.KO ? TaxType.DZN : TaxType.KO

    await this.updateTaxesFromNorisByTaxType(this.lastUpdateTaxType)
  }

  private async updateTaxesFromNorisByTaxType(taxType: TaxType) {
    const currentYear = new Date().getFullYear()

    const taxPayers = await this.prismaService.$queryRaw<
      { id: number; birthNumber: string }[]
    >`SELECT tp.id, tp."birthNumber"
      FROM "TaxPayer" tp
               LEFT JOIN "HistoricalTaxImportAttempt" htia
                         ON htia."taxPayerId" = tp.id
                             AND htia.year = \${currentYear}
                             AND htia."taxType" = \${taxType}::"TaxType"
      WHERE htia.year = \${currentYear}
        AND htia."taxType" = \${taxType}::"TaxType"
        AND htia.status = 'SUCCESS'::"HistoricalTaxImportStatus"
      ORDER BY htia."updatedAt"
      LIMIT \${MAX_NORIS_TAXES_TO_UPDATE}
    `

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

    await this.prismaService.historicalTaxImportAttempt.updateMany({
      where: {
        taxPayerId: {
          in: taxPayers.map((t) => t.id),
        },
        year: currentYear,
        taxType: taxType,
      },
      data: {
        updatedAt: new Date(),
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
    const currentYear = new Date().getFullYear()
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
        year: {
          gte: currentYear, // Only send reminders for the current year and future
        },
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

  @Cron('*/3 * * * *')
  @HandleErrors('Cron Error')
  async loadTaxesForUsers() {
    this.lastLoadedTaxType =
      this.lastLoadedTaxType === TaxType.KO ? TaxType.DZN : TaxType.KO

    this.logger.log(
      `Starting LoadTaxForUsers task for TaxType: ${this.lastLoadedTaxType}`,
    )

    await this.loadTaxDataForUserByTaxType(this.lastLoadedTaxType)
  }

  private async loadTaxDataForUserByTaxType(taxType: TaxType) {
    const currentYear = new Date().getFullYear()

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
        currentYear,
        this.FIRST_HISTORICAL_YEAR,
        importPhase,
      )

    if (newlyCreated.length > 0) {
      await this.loadTaxesForNewlyCreatedUsers(newlyCreated, currentYear)
    }

    this.logger.log(
      `Found ${newlyCreated.length} newly created users, importing all taxes immediately`,
    )

    if (birthNumbers.length > 0) {
      this.logger.log(
        `Found ${birthNumbers.length} existing users, ${importPhase ? 'importing' : 'preparing'}`,
      )
      await (importPhase
        ? this.taxImportHelperSubservice.importTaxes(
            taxType,
            birthNumbers,
            currentYear,
          )
        : this.taxImportHelperSubservice.prepareTaxes(
            taxType,
            birthNumbers,
            currentYear,
          ))
    }

    if (birthNumbers.length === 0 && newlyCreated.length === 0) {
      this.logger.log('No birth numbers found to import taxes')
    }
  }

  private async loadTaxesForNewlyCreatedUsers(
    newlyCreated: string[],
    currentYear: number,
  ) {
    if (newlyCreated.length === 0) {
      return
    }

    this.logger.log(
      `Found ${newlyCreated.length} newly created users, importing all years (${this.FIRST_HISTORICAL_YEAR}-${currentYear}) for both tax types`,
    )

    // Get taxpayer IDs for birth numbers
    const taxPayers = await this.prismaService.taxPayer.findMany({
      where: {
        birthNumber: { in: newlyCreated },
      },
      select: {
        id: true,
        birthNumber: true,
      },
    })

    const birthNumberToTaxPayerId = new Map(
      taxPayers.map((tp) => [tp.birthNumber, tp.id]),
    )

    // Get existing import attempts to avoid re-importing
    const existingAttempts =
      await this.prismaService.historicalTaxImportAttempt.findMany({
        where: {
          taxPayerId: {
            in: taxPayers.map((tp) => tp.id),
          },
        },
        select: {
          taxPayerId: true,
          year: true,
          taxType: true,
        },
      })

    const attemptedSet = new Set(
      existingAttempts.map((a) => `${a.taxPayerId}-${a.year}-${a.taxType}`),
    )

    // Load all years for both tax types, but only if not already attempted
    for (let year = this.FIRST_HISTORICAL_YEAR; year <= currentYear; year++) {
      const suppressEmail = year < currentYear

      // Filter birth numbers that haven't been attempted for DZN
      const birthNumbersToImportDZN = newlyCreated.filter((bn) => {
        const taxPayerId = birthNumberToTaxPayerId.get(bn)
        return (
          taxPayerId &&
          !attemptedSet.has(`${taxPayerId}-${year}-${TaxType.DZN}`)
        )
      })

      if (birthNumbersToImportDZN.length > 0) {
        await this.taxImportHelperSubservice.importTaxes(
          TaxType.DZN,
          birthNumbersToImportDZN,
          year,
          suppressEmail,
        )
      }

      // Filter birth numbers that haven't been attempted for KO
      const birthNumbersToImportKO = newlyCreated.filter((bn) => {
        const taxPayerId = birthNumberToTaxPayerId.get(bn)
        return (
          taxPayerId && !attemptedSet.has(`${taxPayerId}-${year}-${TaxType.KO}`)
        )
      })

      if (birthNumbersToImportKO.length > 0) {
        await this.taxImportHelperSubservice.importTaxes(
          TaxType.KO,
          birthNumbersToImportKO,
          year,
          suppressEmail,
        )
      }
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async loadHistoricalTaxesForExistingUsers() {
    const BATCH_SIZE = 10
    const currentYear = new Date().getFullYear()

    this.logger.log('Starting loadHistoricalTaxesForExistingUsers task')

    // Find taxpayers who have missing historical tax attempts
    // We need to find users who don't have attempts for all year/type combinations
    const taxPayersWithMissingAttempts = await this.prismaService.$queryRaw<
      { id: number; birthNumber: string; year: number; taxType: TaxType }[]
    >`
      WITH required_attempts AS (
        -- Generate all required year/type combinations for each taxpayer
        SELECT
          tp.id as "taxPayerId",
          tp."birthNumber",
          year_series.year,
          tax_type.type as "taxType"
        FROM "TaxPayer" tp
        CROSS JOIN generate_series(${this.FIRST_HISTORICAL_YEAR}, ${currentYear}) AS year_series(year)
        CROSS JOIN (
          SELECT 'DZN'::"TaxType" as type
          UNION ALL
          SELECT 'KO'::"TaxType" as type
        ) AS tax_type
        -- Only include users who have at least one tax (existing users)
        WHERE EXISTS (
          SELECT 1 FROM "Tax" t WHERE t."taxPayerId" = tp.id
        )
      ),
      missing_attempts AS (
        -- Find which required attempts are missing
        SELECT
          ra."taxPayerId",
          ra."birthNumber",
          ra.year,
          ra."taxType"
        FROM required_attempts ra
        LEFT JOIN "HistoricalTaxImportAttempt" htia
          ON htia."taxPayerId" = ra."taxPayerId"
          AND htia.year = ra.year
          AND htia."taxType" = ra."taxType"
        WHERE htia.id IS NULL
      )
      -- Prioritize current year, then descending order for historical years
      SELECT
        "taxPayerId" as id,
        "birthNumber",
        year,
        "taxType"
      FROM missing_attempts
      ORDER BY
        -- Current year first
        CASE WHEN year = ${currentYear} THEN 0 ELSE 1 END,
        -- Then most recent years first
        year DESC,
        -- Then by tax type (consistent ordering)
        "taxType" ASC,
        -- Then by taxpayer ID (consistent ordering)
        "taxPayerId" ASC
      LIMIT ${BATCH_SIZE}
    `

    if (taxPayersWithMissingAttempts.length === 0) {
      this.logger.log('No taxpayers with missing historical tax attempts found')
      return
    }

    this.logger.log(
      `Found ${taxPayersWithMissingAttempts.length} missing historical tax attempts to process`,
    )

    // Process each missing attempt
    for (const attempt of taxPayersWithMissingAttempts) {
      const suppressEmail = attempt.year < currentYear

      this.logger.log(
        `Loading historical tax for taxpayer ${attempt.birthNumber}, year ${attempt.year}, type ${attempt.taxType}`,
      )

      try {
        await this.taxImportHelperSubservice.importTaxes(
          attempt.taxType,
          [attempt.birthNumber],
          attempt.year,
          suppressEmail,
        )
      } catch (error) {
        // Log error but continue with other attempts
        this.logger.error(
          `Failed to load historical tax for taxpayer ${attempt.birthNumber}, year ${attempt.year}, type ${attempt.taxType}`,
          error,
        )

        // Record FAILED status in the tracking table
        await this.prismaService.historicalTaxImportAttempt.upsert({
          where: {
            taxPayerId_year_taxType: {
              taxPayerId: attempt.id,
              year: attempt.year,
              taxType: attempt.taxType,
            },
          },
          create: {
            taxPayerId: attempt.id,
            year: attempt.year,
            taxType: attempt.taxType,
            status: 'FAILED',
            errorMessage:
              error instanceof Error ? error.message : String(error),
          },
          update: {
            status: 'FAILED',
            errorMessage:
              error instanceof Error ? error.message : String(error),
            updatedAt: new Date(),
          },
        })
      }
    }

    this.logger.log(
      `Completed loadHistoricalTaxesForExistingUsers task, processed ${taxPayersWithMissingAttempts.length} attempts`,
    )
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
      result = await this.retryService.retryWithDelay(async () => {
        return this.norisService.updateOverpaymentsDataFromNorisByDateRange(
          data,
        )
        // eslint-disable-next-line no-secrets/no-secrets
      }, 'updateOverpaymentsDataFromNorisByDateRange')

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
