import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import _ from 'lodash'

import { CustomErrorNorisTypesEnum } from '../../noris/noris.errors'
import { NorisService } from '../../noris/noris.service'
import { PrismaService } from '../../prisma/prisma.service'
import { OVERPAYMENTS_LOOKBACK_DAYS } from '../../utils/constants'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { RetryService } from '../../utils-module/retry.service'
import TasksConfigSubservice from './config.service'
import TaxImportHelperService from './tax-import-helper.service'

dayjs.extend(utc)
dayjs.extend(timezone)

const firstHistoricalYear = 2020
const LOAD_HISTORICAL_TAXES_BATCH = 500

@Injectable()
export default class TaxImportTasksService {
  private readonly logger: LineLoggerSubservice

  private lastLoadedTaxType: TaxType = TaxType.DZN

  constructor(
    private readonly databaseSubservice: DatabaseSubservice,
    private readonly norisService: NorisService,
    private readonly taxImportHelperService: TaxImportHelperService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly configSubservice: TasksConfigSubservice,
    private readonly retryService: RetryService,
    private readonly prismaService: PrismaService,
  ) {
    this.logger = new LineLoggerSubservice(TaxImportTasksService.name)
  }

  async loadTaxesForUsers() {
    this.lastLoadedTaxType =
      this.lastLoadedTaxType === TaxType.KO ? TaxType.DZN : TaxType.KO

    this.logger.log(
      `Starting LoadTaxForUsers task for TaxType: ${this.lastLoadedTaxType}`,
    )

    await this.loadTaxDataForUserByTaxType(this.lastLoadedTaxType)
  }

  private async loadTaxDataForUserByTaxType(taxType: TaxType) {
    const thisYear = new Date().getFullYear()

    const [isWithinWindow, todayTaxCount, dailyLimit] = await Promise.all([
      this.taxImportHelperService.isWithinImportWindow(),
      this.taxImportHelperService.getTodayTaxCount(),
      this.taxImportHelperService.getDailyTaxLimit(),
    ])
    const isLimitReached = todayTaxCount >= dailyLimit
    const importPhase = isWithinWindow && !isLimitReached

    this.logger.log(
      `Time window: ${isWithinWindow ? 'OPEN' : 'CLOSED'}, Today's tax count: ${todayTaxCount}/${dailyLimit}, Phase: ${importPhase ? 'IMPORT' : 'PREPARE'}`,
    )

    const { birthNumbers, newlyCreated } =
      await this.taxImportHelperService.getPrioritizedBirthNumbersWithMetadata(
        taxType,
        thisYear,
        firstHistoricalYear,
        importPhase,
      )

    // Import newly created users
    if (newlyCreated.length > 0) {
      this.logger.log(
        `Found ${newlyCreated.length} newly created users, importing all taxes immediately`,
      )

      for (let year = firstHistoricalYear; year <= thisYear; year += 1) {
        // Intentionally sequential: avoid hammering slow DB
        // eslint-disable-next-line no-await-in-loop
        await this.taxImportHelperService.importTaxes(
          TaxType.DZN,
          newlyCreated,
          year,
        )
        // eslint-disable-next-line no-await-in-loop
        await this.taxImportHelperService.importTaxes(
          TaxType.KO,
          newlyCreated,
          year,
        )
      }
    }

    if (birthNumbers.length > 0) {
      this.logger.log(
        `Found ${birthNumbers.length} existing users, ${importPhase ? 'importing' : 'preparing'}`,
      )
      await (importPhase
        ? this.taxImportHelperService.importTaxes(
            taxType,
            birthNumbers,
            thisYear,
          )
        : this.taxImportHelperService.prepareTaxes(
            taxType,
            birthNumbers,
            thisYear,
          ))
    }

    if (birthNumbers.length === 0 && newlyCreated.length === 0) {
      this.logger.log('No birth numbers found to import taxes')
    }
  }

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

  async loadHistoricalTaxes() {
    this.logger.log('Starting loadHistoricalTaxes task')

    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1

    if (previousYear < firstHistoricalYear) {
      this.logger.log('No historical years to process')
      return
    }

    const historicalYears = Array.from(
      { length: previousYear - firstHistoricalYear + 1 },
      (__, i) => firstHistoricalYear + i,
    )

    // Query for users missing specific (year, taxType) combinations
    const missingTaxAttempts = await this.prismaService.$queryRaw<
      { birthNumber: string; year: number; taxType: TaxType }[]
      // language=PostgreSQL
    >`
        SELECT tp."birthNumber",
               years.year,
               tax_types."taxType"
        FROM "TaxPayer" tp
                 CROSS JOIN UNNEST(ARRAY [${historicalYears.join(',')}]) AS years(year)
                 CROSS JOIN UNNEST(ENUM_RANGE(NULL::"TaxType")) AS tax_types("taxType")
        WHERE NOT EXISTS (SELECT 1
                          FROM "TaxImportAttempt" tia
                          WHERE tia."taxPayerId" = tp.id
                            AND tia.year = years.year
                            AND tia."taxType" = tax_types."taxType"
                            -- We want to exclude only resolved attempts
                            AND (tia.status = 'SUCCESS'::"TaxImportStatus" OR
                                 tia.status = 'NOT_FOUND'::"TaxImportStatus"))
        ORDER BY tp."updatedAt", tp.id
        LIMIT ${LOAD_HISTORICAL_TAXES_BATCH};
    `
    if (missingTaxAttempts.length === 0) {
      this.logger.log('No missing historical tax attempts found')
      return
    }

    // Group by year and taxType to batch the import calls
    const grouped = _.groupBy(
      missingTaxAttempts,
      (item) => `${item.year}-${item.taxType}`,
    )

    // Import taxes for each group
    await Promise.all(
      Object.values(grouped).map(async (items) => {
        const first = items[0]
        this.logger.log(
          `Importing ${first.taxType} taxes for ${items.length} users for year ${first.year}`,
        )
        return this.taxImportHelperService.importTaxes(
          first.taxType,
          items.map((item) => item.birthNumber),
          first.year,
        )
      }),
    )

    this.logger.log('Completed loadHistoricalTaxes task')
  }
}
