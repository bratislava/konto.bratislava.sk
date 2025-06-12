import { HttpException, Injectable } from '@nestjs/common'
import { PaymentStatus, Tax } from '@prisma/client'
import currency from 'currency.js'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { NorisPaymentsDto, NorisTaxPayersDto } from '../noris/noris.dto'
import { CustomErrorNorisTypesEnum } from '../noris/noris.errors'
import { NorisService } from '../noris/noris.service'
import {
  DeliveryMethod,
  IsInCityAccount,
  UpdateNorisDeliveryMethods,
} from '../noris/noris.types'
import { PrismaService } from '../prisma/prisma.service'
import { addSlashToBirthNumber } from '../utils/functions/birthNumber'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'
import {
  TaxIdVariableSymbolYear,
  transformDeliveryMethodToDatabaseType,
} from '../utils/types/types.prisma'
import {
  NorisRequestGeneral,
  RequestAdminCreateTestingTaxDto,
  RequestAdminDeleteTaxDto,
  RequestPostNorisLoadDataDto,
  RequestUpdateNorisDeliveryMethodsDto,
} from './dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from './dtos/responses.dto'
import {
  convertCurrencyToInt,
  mapNorisToTaxData,
  mapNorisToTaxEmployeeData,
  mapNorisToTaxInstallmentsData,
  mapNorisToTaxPayerData,
} from './utils/admin.helper'
import { mapNorisToTaxDetailData } from './utils/tax-detail.helper'
import { createTestingTaxMock } from './utils/testing-tax-mock'

@Injectable()
export class AdminService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly qrCodeSubservice: QrCodeSubservice,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly bloomreachService: BloomreachService,
    private readonly norisService: NorisService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice(AdminService.name)
  }

  private async insertTaxPayerDataToDatabase(
    dataFromNoris: NorisTaxPayersDto,
    year: number,
  ) {
    const userData = await this.prismaService.$transaction(async (tx) => {
      const taxPayerData = mapNorisToTaxPayerData(dataFromNoris)
      const taxPayer = await tx.taxPayer.upsert({
        where: {
          birthNumber: dataFromNoris.ICO_RC,
        },
        create: taxPayerData,
        update: taxPayerData,
      })

      const taxEmployeeData = mapNorisToTaxEmployeeData(dataFromNoris)
      const taxEmployee = await tx.taxEmployee.upsert({
        where: {
          id: dataFromNoris.vyb_id,
        },
        create: taxEmployeeData,
        update: {},
      })

      const [qrCodeEmail, qrCodeWeb] = await Promise.all([
        this.qrCodeSubservice.createQrCode({
          amount: convertCurrencyToInt(dataFromNoris.dan_spolu),
          variableSymbol: dataFromNoris.variabilny_symbol,
          specificSymbol: '2024100000',
        }),
        this.qrCodeSubservice.createQrCode({
          amount: convertCurrencyToInt(dataFromNoris.dan_spolu),
          variableSymbol: dataFromNoris.variabilny_symbol,
          specificSymbol: '2024200000',
        }),
      ])

      // deliveryMethod is missing here, since we do not want to update
      // historical taxes with currect delivery method in Noris
      const taxData = mapNorisToTaxData(
        dataFromNoris,
        year,
        taxPayer.id,
        taxEmployee.id,
        qrCodeEmail,
        qrCodeWeb,
      )
      const tax = await tx.tax.upsert({
        where: {
          taxPayerId_year: {
            taxPayerId: taxPayer.id,
            year,
          },
        },
        update: taxData,
        create: {
          ...taxData,
          deliveryMethod: transformDeliveryMethodToDatabaseType(
            dataFromNoris.delivery_method,
          ),
        },
      })

      const taxInstallments = mapNorisToTaxInstallmentsData(
        dataFromNoris,
        tax.id,
      )
      await tx.taxInstallment.createMany({
        data: taxInstallments,
      })

      const taxDetailData = mapNorisToTaxDetailData(dataFromNoris, tax.id)

      await tx.taxDetail.createMany({
        data: taxDetailData,
      })
      return taxPayer
    })

    return userData
  }

  async processNorisTaxData(
    norisData: NorisTaxPayersDto[],
    year: number,
  ): Promise<string[]> {
    const birthNumbersResult: string[] = []

    this.logger.log(`Data loaded from noris - count ${norisData.length}`)

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        norisData.map((norisRecord) => norisRecord.ICO_RC),
      )

    const taxesExist = await this.prismaService.tax.findMany({
      select: {
        taxPayer: {
          select: {
            birthNumber: true,
          },
        },
      },
      where: {
        year: +year,
        taxPayer: {
          birthNumber: {
            in: norisData.map((norisRecord) => norisRecord.ICO_RC),
          },
        },
      },
    })
    const birthNumbersWithExistingTax = new Set(
      taxesExist.map((tax) => tax.taxPayer.birthNumber),
    )

    await Promise.all(
      norisData.map(async (norisItem) => {
        birthNumbersResult.push(norisItem.ICO_RC)

        const taxExists = birthNumbersWithExistingTax.has(norisItem.ICO_RC)
        if (taxExists) {
          return
        }

        const userData = await this.insertTaxPayerDataToDatabase(
          norisItem,
          year,
        )

        const userFromCityAccount =
          userDataFromCityAccount[userData.birthNumber] || null
        if (userFromCityAccount === null) {
          return
        }

        const bloomreachTracker = await this.bloomreachService.trackEventTax(
          {
            amount: convertCurrencyToInt(norisItem.dan_spolu),
            year,
            delivery_method: transformDeliveryMethodToDatabaseType(
              norisItem.delivery_method,
            ),
          },
          userFromCityAccount.externalId ?? undefined,
        )
        if (!bloomreachTracker) {
          this.logger.error(
            this.throwerErrorGuard.InternalServerErrorException(
              ErrorsEnum.INTERNAL_SERVER_ERROR,
              `Error in send Tax data to Bloomreach for tax payer with ID ${userData.id} and year ${year}`,
            ),
          )
        }
      }),
    )

    // Add the payments for these added taxes to database
    await this.updatePaymentsFromNorisWithData(norisData)

    return birthNumbersResult
  }

  async loadDataFromNoris(
    data: RequestPostNorisLoadDataDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    this.logger.log('Start Loading data from noris')
    const norisData = (await this.norisService.getDataFromNoris(
      data,
    )) as NorisTaxPayersDto[]

    const birthNumbersResult: string[] = await this.processNorisTaxData(
      norisData,
      data.year,
    )

    return { birthNumbers: birthNumbersResult }
  }

  async updateDataFromNoris(data: RequestPostNorisLoadDataDto) {
    let norisData: NorisTaxPayersDto[]
    try {
      norisData = (await this.norisService.getDataFromNoris(
        data,
      )) as NorisTaxPayersDto[]
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        CustomErrorNorisTypesEnum.GET_TAXES_FROM_NORIS_ERROR,
        'Failed to get taxes from Noris',
        undefined,
        undefined,
        error,
      )
    }
    let count = 0

    const taxesExist = await this.prismaService.tax.findMany({
      select: {
        id: true,
        taxPayer: {
          select: {
            birthNumber: true,
          },
        },
      },
      where: {
        year: data.year,
        taxPayer: {
          birthNumber: {
            in: norisData.map((norisRecord) => norisRecord.ICO_RC),
          },
        },
      },
    })
    const birthNumberToTax = new Map(
      taxesExist.map((tax) => [tax.taxPayer.birthNumber, tax]),
    )

    await Promise.all(
      norisData.map(async (norisItem) => {
        const taxExists = birthNumberToTax.get(norisItem.ICO_RC)
        if (taxExists) {
          await this.prismaService.taxInstallment.deleteMany({
            where: {
              taxId: taxExists.id,
            },
          })
          await this.prismaService.taxDetail.deleteMany({
            where: {
              taxId: taxExists.id,
            },
          })
          const userData = await this.insertTaxPayerDataToDatabase(
            norisItem,
            data.year,
          )
          if (userData) {
            count += 1
          }
        }
      }),
    )

    return { updated: count }
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

  private formatAmount(amount: number | string) {
    return typeof amount === 'number'
      ? currency(amount).intValue
      : convertCurrencyToInt(amount)
  }

  async updatePaymentsFromNoris(norisRequest: NorisRequestGeneral) {
    const norisPaymentData: Partial<NorisPaymentsDto>[] =
      norisRequest.type === 'fromToDate'
        ? await this.norisService.getPaymentDataFromNoris(norisRequest.data)
        : await this.norisService.getPaymentDataFromNorisByVariableSymbols(
            norisRequest.data,
          )
    return this.updatePaymentsFromNorisWithData(norisPaymentData)
  }

  private async processNorisPaymentData(
    norisPaymentData: Partial<NorisPaymentsDto>[],
    taxesDataByVsMap: Map<string, any>,
    taxPaymentDataMap: Map<number, { sum: number; count: number }>,
    userDataFromCityAccount: Record<string, any> = {},
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
    taxesDataByVsMap: Map<string, any>,
    taxPaymentDataMap: Map<number, { sum: number; count: number }>,
    userDataFromCityAccount: Record<string, any> = {},
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

      const createdTaxPayment = await this.prismaService.taxPayment.create({
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
        error as Error,
      )
    }
  }

  private async trackPaymentIfNeeded(
    taxData: any,
    createdTaxPayment: any,
    userDataFromCityAccount: Record<string, any>,
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

    const successList = await this.processNorisPaymentData(
      norisPaymentData,
      taxesDataByVsMap,
      taxPaymentDataMap,
      userDataFromCityAccount,
    )
    const created = successList.filter((item) => item === 'CREATED').length
    const alreadyCreated = successList.filter(
      (item) => item === 'ALREADY_CREATED',
    ).length
    const errors: HttpException[] = successList.filter(
      (item) => item instanceof Error,
    )

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

  async updateDeliveryMethodsInNoris({
    data,
  }: RequestUpdateNorisDeliveryMethodsDto) {
    /**
     * TODO - concurrency (if someone somehow changes his delivery method during its updating in Noris)
     */
    const deliveryGroups: Record<
      DeliveryMethod,
      { birthNumber: string; date: string | null }[]
    > = {
      [DeliveryMethod.EDESK]: [],
      [DeliveryMethod.CITY_ACCOUNT]: [],
      [DeliveryMethod.POSTAL]: [],
    }

    Object.entries(data).forEach(([birthNumber, methodInfo]) => {
      if (!(methodInfo.deliveryMethod in deliveryGroups)) {
        return
      }

      if (
        methodInfo.deliveryMethod === DeliveryMethod.CITY_ACCOUNT &&
        !methodInfo.date
      ) {
        // We must enforce that the date is present for CITY_ACCOUNT delivery method.
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Date must be provided for birth number ${birthNumber} when delivery method is CITY_ACCOUNT`,
        )
      }

      deliveryGroups[methodInfo.deliveryMethod].push({
        birthNumber: addSlashToBirthNumber(birthNumber),
        date:
          methodInfo.deliveryMethod === DeliveryMethod.CITY_ACCOUNT
            ? methodInfo.date
            : null,
      })
    })

    const updates: UpdateNorisDeliveryMethods[] = Object.entries(deliveryGroups)
      .filter(
        ([deliveryMethod, birthNumbers]) =>
          birthNumbers.length > 0 &&
          deliveryMethod !== DeliveryMethod.CITY_ACCOUNT,
      )
      .map(([deliveryMethod, birthNumbers]) => {
        return {
          birthNumbers: birthNumbers.map((item) => item.birthNumber),
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: deliveryMethod as DeliveryMethod,
          date: null, // date of confirmation of delivery method should be set only for city account notification
        }
      })

    deliveryGroups[DeliveryMethod.CITY_ACCOUNT].forEach((item) => {
      updates.push({
        birthNumbers: [item.birthNumber],
        inCityAccount: IsInCityAccount.YES,
        deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
        date: item.date,
      })
    })

    if (updates.length > 0) {
      await this.norisService.updateDeliveryMethods(updates)
    }
  }

  async removeDeliveryMethodsFromNoris(birthNumber: string): Promise<void> {
    await this.norisService.updateDeliveryMethods([
      {
        birthNumbers: [addSlashToBirthNumber(birthNumber)],
        inCityAccount: IsInCityAccount.NO,
        deliveryMethod: null,
        date: null,
      },
    ])
  }

  async updateTaxesFromNoris(taxes: TaxIdVariableSymbolYear[]): Promise<void> {
    const variableSymbolToId = new Map(
      taxes.map((tax) => [tax.variableSymbol, tax.id]),
    )
    const variableSymbols = [...variableSymbolToId.keys()]
    const years = [...new Set(taxes.map((tax) => tax.year))]
    const data = await this.norisService.getDataForUpdate(
      variableSymbols,
      years,
    )
    const variableSymbolsToNonNullDateFromNoris: Map<string, string> = new Map(
      data
        .filter((item) => item.datum_platnosti !== null)
        .map((item) => [
          item.variabilny_symbol,
          item.datum_platnosti as string,
        ]),
    )

    await this.prismaService.$transaction(
      [...variableSymbolsToNonNullDateFromNoris.entries()].map(
        ([variableSymbol, dateTaxRuling]) =>
          this.prismaService.tax.update({
            where: { id: variableSymbolToId.get(variableSymbol) },
            data: { dateTaxRuling },
          }),
      ),
    )
  }

  /**
   * Creates a testing tax record with specified details for development and testing purposes.
   * WARNING! This tax should be removed after testing, with the endpoint `delete-testing-tax`.
   */
  async createTestingTax({
    year,
    norisData,
  }: RequestAdminCreateTestingTaxDto): Promise<void> {
    const taxEmployee = await this.prismaService.taxEmployee.findFirst({})
    if (!taxEmployee) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'No tax employee found in the database',
      )
    }

    // Generate the mock tax record
    const mockTaxRecord = createTestingTaxMock(norisData, taxEmployee, year)

    // Process the mock data to create the testing tax
    await this.processNorisTaxData([mockTaxRecord], year)
  }

  async deleteTax({
    year,
    birthNumber,
  }: RequestAdminDeleteTaxDto): Promise<void> {
    const birthNumberWithSlash = addSlashToBirthNumber(birthNumber)
    const taxPayer = await this.prismaService.taxPayer.findUnique({
      where: {
        birthNumber: birthNumberWithSlash,
      },
    })
    if (!taxPayer) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Tax payer not found',
      )
    }

    const tax = await this.prismaService.tax.findUnique({
      where: {
        taxPayerId_year: {
          taxPayerId: taxPayer.id,
          year,
        },
      },
    })
    if (!tax) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Tax not found',
      )
    }

    await this.prismaService.$transaction([
      this.prismaService.taxPayment.deleteMany({
        where: {
          taxId: tax.id,
        },
      }),
      this.prismaService.taxInstallment.deleteMany({
        where: {
          taxId: tax.id,
        },
      }),
      this.prismaService.taxDetail.deleteMany({
        where: {
          taxId: tax.id,
        },
      }),
      this.prismaService.tax.delete({
        where: {
          taxPayerId_year: {
            taxPayerId: taxPayer.id,
            year,
          },
        },
      }),
    ])

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdmin(birthNumber)
    if (!userDataFromCityAccount) {
      return
    }

    const bloomreachResponse = await this.bloomreachService.trackEventTax(
      {
        year,
        amount: 0,
        delivery_method: null,
      },
      userDataFromCityAccount.externalId ?? undefined,
    )
    if (!bloomreachResponse) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Error in send Tax data to Bloomreach for tax payer with ID ${taxPayer.id} and year ${year}`,
        ),
      )
    }
  }
}
