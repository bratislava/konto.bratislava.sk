import { Injectable, Logger } from '@nestjs/common'
import { PaymentStatus, Tax, TaxPayment } from '@prisma/client'
import currency from 'currency.js'
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
import { queryPaymentsFromNoris } from '../utils/noris.queries'
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
    const connection = await this.connectionService.createConnection()
    let { fromDate } = data
    let { toDate } = data
    if (!fromDate) {
      const newFromDate = new Date(`${data.year}-04-01`)
      fromDate = newFromDate.toDateString()
    }
    if (!toDate) {
      const newToDate = new Date()
      newToDate.setHours(0, 0, 0, 0)
      toDate = newToDate.toDateString()
    }
    let overpayments = ''
    if (data.overPayments) {
      overpayments =
        'OR lcs.dane21_doklad_sum_saldo.datum_posledni_platby is NULL'
    }
    const norisData = await connection.query(
      queryPaymentsFromNoris
        .replaceAll(
          '{%FROM_TO_AND_OVERPAYMENTS_SETTINGS%}',
          `AND (
            (lcs.dane21_doklad_sum_saldo.datum_posledni_platby >= '${fromDate}' AND lcs.dane21_doklad_sum_saldo.datum_posledni_platby <= '${toDate}')
            ${overpayments}
        )`,
        )
        .replaceAll('{%YEARS%}', `= ${data.year.toString()}`)
        .replaceAll('{%VARIABLE_SYMBOLS%}', ''),
    )
    connection.close()
    return norisData.recordset
  }

  async getPaymentDataFromNorisByVariableSymbols(
    data: RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  ) {
    const connection = await this.connectionService.createConnection()

    let variableSymbols = ''
    data.variableSymbols.forEach((variableSymbol) => {
      if (/^\d+$/.test(variableSymbol)) {
        variableSymbols += `'${variableSymbol}',`
      } else {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            `Variable symbol has a wrong format: "${variableSymbol}"`,
          ),
        )
      }
    })
    variableSymbols = `(${variableSymbols.slice(0, -1)})`

    if (data.years.length === 0) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Years are empty in payment data import from Noris request.',
      )
    }

    const norisData = await connection.query(
      queryPaymentsFromNoris
        .replaceAll('{%YEARS%}', `IN (${data.years.join(',')})`)
        .replaceAll(
          '{%VARIABLE_SYMBOLS%}',
          `AND dane21_doklad.variabilny_symbol IN ${variableSymbols}`,
        )
        .replaceAll('{%FROM_TO_AND_OVERPAYMENTS_SETTINGS%}', ''),
    )
    connection.close()
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
        norisPayment.uhrazeno !== undefined &&
        norisPayment.zbyva_uhradit !== undefined,
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
      const toPayFromNoris = this.formatAmount(norisPayment.zbyva_uhradit!)

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

      this.handlePaymentsErrors(
        paidFromNoris,
        taxData,
        toPayFromNoris,
        payerData.count,
      )
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
          taxType: taxData.type,
          order: taxData.order!, // non-null by DB trigger
        },
        userFromCityAccount.externalId,
      )
    }
  }

  // TODO: Eventually we want to get rid of this function, and do some better error handling, than watching these specific cases.
  /**
   * This function handles errors in the payment process. It logs an error message if the payment process is not correct, with the info about why it is not correct.
   *
   * @param paidFromNoris Already paid amount in Noris.
   * @param taxData Tax object, containing all the information about the tax.
   * @param forPayment Left to be paid amount in Noris.
   * @param payerDataCountAll How many payments for this tax we have in the database.
   */
  private handlePaymentsErrors(
    paidFromNoris: number,
    taxData: Tax,
    forPayment: number,
    payerDataCountAll: number,
  ) {
    if (paidFromNoris > taxData.amount && forPayment === 0) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'ZAPLATENE VSETKO ALE V NORISE JE VACSIA CIASTKA AKO U NAS',
        ),
      )
    } else if (
      payerDataCountAll === 0 &&
      paidFromNoris >= taxData.amount &&
      forPayment > 0
    ) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'U NAS ZAPLATENE VSETKO ALE V NORISE NIE - na 1x',
        ),
      )
    } else if (
      payerDataCountAll > 0 &&
      paidFromNoris >= taxData.amount &&
      forPayment > 0
    ) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'U NAS ZAPLATENE VSETKO ALE V NORISE NIE - na x krat',
        ),
      )
    }
  }
}
