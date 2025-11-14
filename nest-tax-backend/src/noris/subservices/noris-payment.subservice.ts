import { Injectable, Logger } from '@nestjs/common'
import { PaymentStatus, TaxPayment } from '@prisma/client'
import currency from 'currency.js'
import * as mssql from 'mssql'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'
import pLimit from 'p-limit'

import {
  DateRangeDto,
  RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  RequestPostNorisPaymentDataLoadDto,
} from '../../admin/dtos/requests.dto'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PrismaService } from '../../prisma/prisma.service'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { TaxWithTaxPayer } from '../../utils/types/types.prisma'
import { ResponseCreatedAlreadyCreatedDto } from '../dtos/response.dto'
import {
  NorisPaymentWithVariableSymbol,
  NorisTaxPayment,
} from '../types/noris.types'
import { convertCurrencyToInt } from '../utils/mapping.helper'
import {
  queryOverpaymentsFromNorisByDateRange,
  queryPaymentsFromNorisByFromToDate,
  queryPaymentsFromNorisByVariableSymbols,
} from '../utils/noris.queries'
import { NorisConnectionSubservice } from './noris-connection.subservice'
import { NorisValidatorSubservice } from './noris-validator.subservice'
import { NorisTaxPaymentSchema } from '../types/noris.schema'

@Injectable()
export class NorisPaymentSubservice {
  private readonly logger: Logger = new Logger('NorisService')

  private readonly concurrency = Number(process.env.DB_CONCURRENCY ?? 10)

  private readonly concurrencyLimit = pLimit(this.concurrency)

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
    private readonly prismaService: PrismaService,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly bloomreachService: BloomreachService,
    private readonly norisValidatorSubservice: NorisValidatorSubservice,
  ) {}

  async getPaymentDataFromNoris(
    data: RequestPostNorisPaymentDataLoadDto,
  ): Promise<NorisTaxPayment[]> {
    const { fromDate, toDate, overPayments, year } = data

    const norisData = await this.connectionService.withConnection(
      async (connection) => {
        const request = new mssql.Request(connection)

        request.input('fromDate', mssql.SmallDateTime, fromDate)
        request.input('toDate', mssql.SmallDateTime, toDate)
        request.input('overPayments', mssql.TinyInt, overPayments ? 1 : 0)
        request.input('years', mssql.Int, year)

        return request.query(queryPaymentsFromNorisByFromToDate)
      },
      (error) => {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to get payment data from Noris by date range.',
          undefined,
          error instanceof Error ? undefined : <string>error,
          error instanceof Error ? error : undefined,
        )
      },
    )
    return this.norisValidatorSubservice.validateNorisData(
      NorisTaxPaymentSchema,
      norisData.recordset,
    )
  }

  async getPaymentDataFromNorisByVariableSymbols(
    data: RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  ): Promise<NorisTaxPayment[]> {
    const filteredVariableSymbols = data.variableSymbols.filter(
      (variableSymbol) => {
        if (/^\d+$/.test(variableSymbol)) {
          return true
        }
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            `Variable symbol has a wrong format: "${variableSymbol}"`,
          ),
        )
        return false
      },
    )

    if (data.years.length === 0) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Years are empty in payment data import from Noris request.',
      )
    }

    const norisData = await this.connectionService.withConnection(
      async (connection) => {
        const request = new mssql.Request(connection)

        const yearPlaceholders = data.years
          .map((_, index) => `@year${index}`)
          .join(',')
        data.years.forEach((year, index) => {
          request.input(`year${index}`, mssql.Int, year)
        })

        const variableSymbolsPlaceholders = filteredVariableSymbols
          .map((_, index) => `@variable_symbol${index}`)
          .join(',')
        filteredVariableSymbols.forEach((variableSymbol, index) => {
          request.input(
            `variable_symbol${index}`,
            mssql.VarChar(20),
            variableSymbol,
          )
        })

        return request.query(
          queryPaymentsFromNorisByVariableSymbols
            .replaceAll('@years', yearPlaceholders)
            .replaceAll('@variable_symbols', variableSymbolsPlaceholders),
        )
      },
      (error) => {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to get payment data from Noris by variable symbols.',
          undefined,
          error instanceof Error ? undefined : <string>error,
          error instanceof Error ? error : undefined,
        )
      },
    )
    return this.norisValidatorSubservice.validateNorisData(
      NorisTaxPaymentSchema,
      norisData.recordset,
    )
  }

  async updateOverpaymentsDataFromNorisByDateRange(
    data: DateRangeDto,
    bloomreachSettings?: {
      suppressEmail?: boolean
    },
  ): Promise<ResponseCreatedAlreadyCreatedDto> {
    const overpaymentsData = await this.connectionService.withConnection(
      async (connection) => {
        const request = new mssql.Request(connection)

        request.input('fromDate', mssql.SmallDateTime, data.fromDate)
        request.input('toDate', mssql.SmallDateTime, data.toDate ?? new Date())

        return request.query(queryOverpaymentsFromNorisByDateRange)
      },
      (error) => {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to get overpayments data from Noris by date range.',
          undefined,
          error instanceof Error ? undefined : <string>error,
          error instanceof Error ? error : undefined,
        )
      },
    )

    const validatedOverpaymentsData =
      this.norisValidatorSubservice.validateNorisData(
        NorisTaxPaymentSchema,
        overpaymentsData.recordset,
      )
    return this.updatePaymentsFromNorisWithData(
      validatedOverpaymentsData,
      bloomreachSettings,
    )
  }

  private async createTaxMapByVariableSymbol(norisPaymentData: NorisTaxPayment[]) {
    const taxesData = await this.prismaService.tax.findMany({
      where: {
        variableSymbol: {
          in: norisPaymentData
            .map((item) => item.variabilny_symbol)
            .filter((item) => item !== null && item !== undefined),
        },
      },
      include: {
        taxPayer: true,
      },
    })
    return new Map(taxesData.map((item) => [item.variableSymbol, item]))
  }

  async updatePaymentsFromNorisWithData(
    norisPaymentData: NorisTaxPayment[],
    bloomreachSettings?: {
      suppressEmail?: boolean
    },
  ): Promise<ResponseCreatedAlreadyCreatedDto> {
    const taxesDataByVsMap =
      await this.createTaxMapByVariableSymbol(norisPaymentData)

    // Get batch data from city account
    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        Array.from(
          taxesDataByVsMap.values(),
          (taxData) => taxData.taxPayer.birthNumber,
        ),
      )

    const resultList = await this.processNorisPaymentData(
      norisPaymentData,
      taxesDataByVsMap,
      userDataFromCityAccount,
      bloomreachSettings,
    )
    const created = resultList.filter((item) => item === 'CREATED').length
    const alreadyCreated = resultList.filter(
      (item) => item === 'ALREADY_CREATED',
    ).length
    const errors: Error[] = resultList.filter((item) => item instanceof Error)

    if (errors.length > 0) {
      this.logger.error(
        'Encountered errors while batch processing Noris payments:',
        errors,
      )
    }

    return {
      created,
      alreadyCreated,
    }
  }

  private hasVariableSymbol(
    payment: NorisTaxPayment,
  ): payment is NorisPaymentWithVariableSymbol {
    return (
      payment.variabilny_symbol !== null && payment.variabilny_symbol !== ''
    )
  }

  private async processNorisPaymentData(
    norisPaymentData: NorisTaxPayment[],
    taxesDataByVsMap: Map<string, TaxWithTaxPayer>,
    userDataFromCityAccount: Record<string, ResponseUserByBirthNumberDto> = {},
    bloomreachSettings?: {
      suppressEmail?: boolean
    },
  ) {
    const validPayments = norisPaymentData.filter((payment) =>
      this.hasVariableSymbol(payment),
    )

    // Step 2: Process each payment separately with concurrency limit
    const paymentProcesses = validPayments.map((norisPayment) =>
      this.concurrencyLimit(async () =>
        this.processIndividualPayment(
          norisPayment,
          taxesDataByVsMap,
          userDataFromCityAccount,
          bloomreachSettings,
        ),
      ),
    )

    // Step 3: Execute all payment processes with limited concurrency
    return Promise.all(paymentProcesses)
  }

  private async processIndividualPayment(
    norisPayment: NorisPaymentWithVariableSymbol,
    taxesDataByVsMap: Map<string, TaxWithTaxPayer>,
    userDataFromCityAccount: Record<string, ResponseUserByBirthNumberDto> = {},
    bloomreachSettings?: {
      suppressEmail?: boolean
    },
  ) {
    try {
      const taxData = taxesDataByVsMap.get(norisPayment.variabilny_symbol)

      if (!taxData) {
        return 'NOT_EXIST'
      }

      const paidFromNoris = this.formatAmount(norisPayment.uhrazeno)

      return await this.prismaService.$transaction(async (tx) => {
        // Lock the tax row to prevent concurrent updates
        await tx.$queryRaw`SELECT id FROM "Tax" WHERE id = ${taxData.id} FOR UPDATE`

        const currentSum = await tx.taxPayment.aggregate({
          where: {
            taxId: taxData.id,
            status: PaymentStatus.SUCCESS,
          },
          _sum: { amount: true },
        })

        const alreadyPaid = currentSum._sum.amount ?? 0
        const difference = paidFromNoris - alreadyPaid

        if (difference <= 0) {
          return 'ALREADY_CREATED'
        }

        const createdTaxPayment = await tx.taxPayment.create({
          data: {
            amount: difference,
            source: 'BANK_ACCOUNT',
            specificSymbol: norisPayment.specificky_symbol,
            taxId: taxData.id,
            status: PaymentStatus.SUCCESS,
          },
        })

        await this.trackPaymentIfNeeded(
          taxData,
          createdTaxPayment,
          userDataFromCityAccount,
          bloomreachSettings,
        )

        return 'CREATED'
      })
    } catch (error) {
      return this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        undefined,
        undefined,
        error,
      )
    }
  }

  private formatAmount(amount: number | string) {
    return typeof amount === 'number'
      ? currency(amount).intValue
      : convertCurrencyToInt(amount)
  }

  private async trackPaymentIfNeeded(
    taxData: TaxWithTaxPayer,
    createdTaxPayment: TaxPayment,
    userDataFromCityAccount: Record<string, ResponseUserByBirthNumberDto>,
    bloomreachSettings?: {
      suppressEmail?: boolean
    },
  ) {
    const userFromCityAccount =
      userDataFromCityAccount[taxData.taxPayer.birthNumber] || null

    if (userFromCityAccount && userFromCityAccount.externalId) {
      const result = await this.bloomreachService.trackEventTaxPayment(
        {
          amount: createdTaxPayment.amount,
          payment_source: 'BANK_ACCOUNT',
          year: taxData.year,
          taxType: taxData.type,
          order: taxData.order!, // non-null by DB trigger and constraint
          suppress_email: bloomreachSettings?.suppressEmail ?? false,
        },
        userFromCityAccount.externalId,
      )
      if (!result) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to track payment in Bloomreach.',
        )
      }
    }
  }
}
