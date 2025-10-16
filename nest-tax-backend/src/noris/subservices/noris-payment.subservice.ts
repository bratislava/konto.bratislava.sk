import { Injectable, Logger } from '@nestjs/common'
import { PaymentStatus, TaxPayment } from '@prisma/client'
import currency from 'currency.js'
import { Request } from 'mssql'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'

import {
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
import { NorisPaymentsDto } from '../noris.dto'
import { convertCurrencyToInt } from '../utils/mapping.helper'
import {
  queryPaymentsFromNorisByFromToDate,
  queryPaymentsFromNorisByVariableSymbols,
} from '../utils/noris.queries'
import { NorisConnectionSubservice } from './noris-connection.subservice'

@Injectable()
export class NorisPaymentSubservice {
  private readonly logger: Logger = new Logger('NorisService')

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
    private readonly prismaService: PrismaService,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly bloomreachService: BloomreachService,
  ) {}

  async getPaymentDataFromNoris(data: RequestPostNorisPaymentDataLoadDto) {
    const { fromDate, toDate, overPayments, year } = data

    const norisData = await this.connectionService.withConnection(
      async (connection) => {
        const request = new Request(connection)

        request.input('fromDate', fromDate)
        request.input('toDate', toDate)
        request.input('overPayments', overPayments ? 1 : 0)
        request.input('years', year)

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
    return norisData.recordset
  }

  async getPaymentDataFromNorisByVariableSymbols(
    data: RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  ) {
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
        const request = new Request(connection)

        const yearPlaceholders = data.years
          .map((_, index) => `@year${index}`)
          .join(',')
        data.years.forEach((year, index) => {
          request.input(`year${index}`, year)
        })

        const variableSymbolsPlaceholders = filteredVariableSymbols
          .map((_, index) => `@variable_symbol${index}`)
          .join(',')
        filteredVariableSymbols.forEach((variableSymbol, index) => {
          request.input(`variable_symbol${index}`, variableSymbol)
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
    return norisData.recordset
  }

  private async createTaxMapByVariableSymbol(
    norisPaymentData: Partial<NorisPaymentsDto>[],
  ) {
    const taxesData = await this.prismaService.tax.findMany({
      where: {
        variableSymbol: {
          in: norisPaymentData
            .filter((item) => item.variabilny_symbol !== undefined)
            .map((item) => item.variabilny_symbol as string),
        },
      },
      include: {
        taxPayer: true,
      },
    })
    return new Map(taxesData.map((item) => [item.variableSymbol, item]))
  }

  async updatePaymentsFromNorisWithData(
    norisPaymentData: Partial<NorisPaymentsDto>[],
  ) {
    const taxesDataByVsMap =
      await this.createTaxMapByVariableSymbol(norisPaymentData)

    // Get all tax IDs from taxesDataByVsMap
    const taxIds = Array.from(taxesDataByVsMap.values(), (tax) => tax.id)

    // Get aggregate payment data for all taxes at once
    const taxPaymentDataMap = await this.fetchTaxPaymentAggregateMap(taxIds)

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
      taxPaymentDataMap,
      userDataFromCityAccount,
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

  private async fetchTaxPaymentAggregateMap(taxIds: number[]) {
    const aggregateData = await this.prismaService.taxPayment.groupBy({
      by: ['taxId'],
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
      where: {
        taxId: {
          in: taxIds,
        },
        status: PaymentStatus.SUCCESS,
      },
    })

    // Create a map of aggregated data for easy lookup
    return new Map(
      aggregateData.map((data) => [
        data.taxId,
        {
          sum: data._sum.amount || 0,
          count: data._count._all,
        },
      ]),
    )
  }

  private async processNorisPaymentData(
    norisPaymentData: Partial<NorisPaymentsDto>[],
    taxesDataByVsMap: Map<string, TaxWithTaxPayer>,
    taxPaymentDataMap: Map<number, { sum: number; count: number }>,
    userDataFromCityAccount: Record<string, ResponseUserByBirthNumberDto> = {},
  ) {
    const validPayments = norisPaymentData.filter(
      (norisPayment) =>
        norisPayment.variabilny_symbol !== undefined &&
        norisPayment.uhrazeno !== undefined,
    )

    // Step 2: Process each payment separately
    const paymentProcesses = validPayments.map((norisPayment) =>
      this.processIndividualPayment(
        norisPayment,
        taxesDataByVsMap,
        taxPaymentDataMap,
        userDataFromCityAccount,
      ),
    )

    // Step 3: Execute all payment processes concurrently
    return Promise.all(paymentProcesses)
  }

  private async processIndividualPayment(
    norisPayment: Partial<NorisPaymentsDto>,
    taxesDataByVsMap: Map<string, TaxWithTaxPayer>,
    taxPaymentDataMap: Map<number, { sum: number; count: number }>,
    userDataFromCityAccount: Record<string, ResponseUserByBirthNumberDto> = {},
  ) {
    try {
      const taxData = taxesDataByVsMap.get(norisPayment.variabilny_symbol!)

      if (!taxData) {
        return 'NOT_EXIST'
      }

      const payerData = taxPaymentDataMap.get(taxData.id) || {
        sum: 0,
        count: 0,
      }
      const paidFromNoris = this.formatAmount(norisPayment.uhrazeno!)

      // Early return if payment already recorded
      if (payerData.sum !== null && payerData.sum >= paidFromNoris) {
        return 'ALREADY_CREATED'
      }

      await this.prismaService.$transaction(async (tx) => {
        const createdTaxPayment = await tx.taxPayment.create({
          data: {
            amount: paidFromNoris - (payerData.sum ?? 0),
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
        )
      })

      return 'CREATED'
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
  ) {
    const userFromCityAccount =
      userDataFromCityAccount[taxData.taxPayer.birthNumber] || null

    if (userFromCityAccount && userFromCityAccount.externalId) {
      await this.bloomreachService.trackEventTaxPayment(
        {
          amount: createdTaxPayment.amount,
          payment_source: 'BANK_ACCOUNT',
          year: taxData.year,
        },
        userFromCityAccount.externalId,
      )
    }
  }
}
