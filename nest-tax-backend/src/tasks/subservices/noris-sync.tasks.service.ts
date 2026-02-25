import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  DeliveryMethodNamed,
  PaymentStatus,
  Prisma,
  TaxType,
} from '@prisma/client'
import dayjs from 'dayjs'

import { CustomErrorNorisTypesEnum } from '../../noris/noris.errors'
import { NorisService } from '../../noris/noris.service'
import { NorisTaxPayment } from '../../noris/types/noris.types'
import { PrismaService } from '../../prisma/prisma.service'
import {
  MAX_NORIS_PAYMENTS_BATCH_SELECT,
  OVERPAYMENTS_LOOKBACK_DAYS,
} from '../../utils/constants'
import HandleErrors from '../../utils/decorators/errorHandler.decorator'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { RetryService } from '../../utils-module/retry.service'
import TasksConfigSubservice from './config.subservice'

@Injectable()
export class NorisSyncTasksService {
  private readonly lastLoadedTaxType: TaxType = TaxType.DZN

  private lastUpdateTaxType: TaxType = TaxType.KO

  private readonly FIRST_HISTORICAL_YEAR = 2020

  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly configService: ConfigService,
    private readonly configSubservice: TasksConfigSubservice,
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly norisService: NorisService,
    private readonly databaseSubservice: DatabaseSubservice,
    private readonly retryService: RetryService,
  ) {
    this.logger = new LineLoggerSubservice(NorisSyncTasksService.name)
  }

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
        taxType,
      },
      data: {
        updatedAt: new Date(),
      },
    })
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
