import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

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
const LOAD_HISTORICAL_TAXES_BATCH = 10

@Injectable()
export default class TaxImportTasksService {
  private readonly logger: LineLoggerSubservice

  private lastLoadedTaxType: TaxType = TaxType.DZN

  constructor(
    private readonly databaseSubservice: DatabaseSubservice,
    private readonly norisService: NorisService,
    private readonly taxImportHelperSubservice: TaxImportHelperService,
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
        await this.taxImportHelperSubservice.importTaxes(
          TaxType.DZN,
          newlyCreated,
          year,
        )
        // eslint-disable-next-line no-await-in-loop
        await this.taxImportHelperSubservice.importTaxes(
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
        ? this.taxImportHelperSubservice.importTaxes(
            taxType,
            birthNumbers,
            thisYear,
          )
        : this.taxImportHelperSubservice.prepareTaxes(
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
      (_, i) => firstHistoricalYear + i,
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
                          FROM "HistoricalTaxImportAttempt" htia
                          WHERE htia."taxPayerId" = tp.id
                            AND htia.year = years.year
                            AND htia."taxType" = tax_types."taxType")
        ORDER BY tp."updatedAt", tp.id
        LIMIT ${LOAD_HISTORICAL_TAXES_BATCH};
    `
    // TODO add support for retrying failed attempts

    if (missingTaxAttempts.length === 0) {
      this.logger.log('No missing historical tax attempts found')
      return
    }

    // Group by year and taxType to batch the import calls
    const groupedByYearAndType = new Map<
      string,
      { year: number; taxType: TaxType; birthNumbers: string[] }
    >()

    missingTaxAttempts.forEach((item) => {
      const key = `${item.year}-${item.taxType}`
      const existing = groupedByYearAndType.get(key)
      if (existing) {
        existing.birthNumbers.push(item.birthNumber)
      } else {
        groupedByYearAndType.set(key, {
          year: item.year,
          taxType: item.taxType,
          birthNumbers: [item.birthNumber],
        })
      }
    })

    // Import taxes for each group
    await Promise.all(
      [...groupedByYearAndType.values()].map(async (group) => {
        this.logger.log(
          `Importing ${group.taxType} taxes for ${group.birthNumbers.length} users for year ${group.year}`,
        )
        return this.taxImportHelperSubservice.importTaxes(
          group.taxType,
          group.birthNumbers,
          group.year,
        )
      }),
    )

    this.logger.log('Completed loadHistoricalTaxes task')
  }
}
