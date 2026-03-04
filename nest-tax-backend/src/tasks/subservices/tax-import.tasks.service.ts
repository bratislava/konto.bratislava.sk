import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { NorisService } from '../../noris/noris.service'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import TaxImportHelperService from './tax-import-helper.service'
import { CustomErrorNorisTypesEnum } from '../../noris/noris.errors'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import TasksConfigSubservice from './config.service'
import { RetryService } from '../../utils-module/retry.service'
import { OVERPAYMENTS_LOOKBACK_DAYS } from '../../utils/constants'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'

dayjs.extend(utc)
dayjs.extend(timezone)

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
}
