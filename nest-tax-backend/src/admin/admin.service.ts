import { Injectable, Logger } from '@nestjs/common'
import { PaymentStatus, Tax } from '@prisma/client'
import currency from 'currency.js'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { NorisPaymentsDto, NorisTaxPayersDto } from '../noris/noris.dto'
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
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'
import {
  TaxIdVariableSymbol,
  transformDeliveryMethodToDatabaseType,
} from '../utils/types/types.prisma'
import {
  NorisRequestGeneral,
  RequestAdminBloomreachCustomerEventTaxPaymentDto,
  RequestAdminCreateTestingTaxDto,
  RequestAdminDeleteTaxDto,
  RequestPostNorisLoadDataDto,
  RequestUpdateNorisDeliveryMethodsDto,
} from './dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from './dtos/responses.dto'
import { taxDetail } from './utils/tax-detail.helper'
import { createTestingTaxMock } from './utils/testing-tax-mock'

@Injectable()
export class AdminService {
  private readonly logger: Logger

  constructor(
    private readonly prismaService: PrismaService,
    private readonly qrCodeSubservice: QrCodeSubservice,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly bloomreachService: BloomreachService,
    private readonly norisService: NorisService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new Logger(AdminService.name)
  }

  private async insertTaxPayerDataToDatabase(
    dataFromNoris: NorisTaxPayersDto,
    year: number,
  ) {
    const userData = await this.prismaService.$transaction(async (tx) => {
      const taxPayer = await tx.taxPayer.upsert({
        where: {
          birthNumber: dataFromNoris.ICO_RC,
        },
        create: {
          active: true,
          birthNumber: dataFromNoris.ICO_RC,
          permanentResidenceAddress: dataFromNoris.adresa_tp_sidlo,
          externalId: dataFromNoris.subjekt_refer,
          name: dataFromNoris.subjekt_nazev,
          permanentResidenceStreet: dataFromNoris.ulica_tb_cislo,
          permanentResidenceZip: dataFromNoris.psc_ref_tb,
          permanentResidenceStreetTxt: dataFromNoris.TXT_UL,
          permanentResidenceCity: dataFromNoris.obec_nazev_tb,
          nameTxt: dataFromNoris.TXT_MENO,
        },
        update: {
          active: true,
          birthNumber: dataFromNoris.ICO_RC,
          permanentResidenceAddress: dataFromNoris.adresa_tp_sidlo,
          externalId: dataFromNoris.subjekt_refer,
          name: dataFromNoris.subjekt_nazev,
          permanentResidenceStreet: dataFromNoris.ulica_tb_cislo,
          permanentResidenceZip: dataFromNoris.psc_ref_tb,
          permanentResidenceStreetTxt: dataFromNoris.TXT_UL,
          permanentResidenceCity: dataFromNoris.obec_nazev_tb,
          nameTxt: dataFromNoris.TXT_MENO,
        },
      })

      const taxEmployee = await tx.taxEmployee.upsert({
        where: {
          id: dataFromNoris.vyb_id,
        },
        create: {
          email: dataFromNoris.vyb_email,
          externalId: dataFromNoris.cislo_poradace.toString(),
          id: dataFromNoris.vyb_id,
          name: dataFromNoris.vyb_nazov,
          phoneNumber: dataFromNoris.vyb_telefon_prace,
        },
        update: {},
      })
      const qrCodeEmail = await this.qrCodeSubservice.createQrCode({
        amount: currency(dataFromNoris.dan_spolu.replace(',', '.')).intValue,
        variableSymbol: dataFromNoris.variabilny_symbol,
        specificSymbol: '2024100000',
      })
      const qrCodeWeb = await this.qrCodeSubservice.createQrCode({
        amount: currency(dataFromNoris.dan_spolu.replace(',', '.')).intValue,
        variableSymbol: dataFromNoris.variabilny_symbol,
        specificSymbol: '2024200000',
      })

      const tax = await tx.tax.upsert({
        where: {
          taxPayerId_year: {
            taxPayerId: taxPayer.id,
            year,
          },
        },
        update: {
          amount: currency(dataFromNoris.dan_spolu.replace(',', '.')).intValue,
          year,
          taxEmployeeId: taxEmployee.id,
          taxPayerId: taxPayer.id,
          variableSymbol: dataFromNoris.variabilny_symbol,
          dateCreateTax: dataFromNoris.akt_datum,
          dateTaxRuling: dataFromNoris.datum_platnosti,
          taxId: dataFromNoris.cislo_konania,
          taxLand: currency(dataFromNoris.dan_pozemky.replace(',', '.'))
            .intValue,
          taxConstructions: currency(
            dataFromNoris.dan_stavby_SPOLU.replace(',', '.'),
          ).intValue,
          taxFlat: currency(dataFromNoris.dan_byty.replace(',', '.')).intValue,
          qrCodeEmail,
          qrCodeWeb,
          // deliveryMethod is missing here, since we do not want to update historical taxes with currect delivery method in Noris
        },
        create: {
          amount: currency(dataFromNoris.dan_spolu.replace(',', '.')).intValue,
          year,
          taxEmployeeId: taxEmployee.id,
          taxPayerId: taxPayer.id,
          variableSymbol: dataFromNoris.variabilny_symbol,
          dateCreateTax: dataFromNoris.akt_datum,
          dateTaxRuling: dataFromNoris.datum_platnosti,
          taxId: dataFromNoris.cislo_konania,
          taxLand: currency(dataFromNoris.dan_pozemky.replace(',', '.'))
            .intValue,
          taxConstructions: currency(
            dataFromNoris.dan_stavby_SPOLU.replace(',', '.'),
          ).intValue,
          taxFlat: currency(dataFromNoris.dan_byty.replace(',', '.')).intValue,
          qrCodeEmail,
          qrCodeWeb,
          deliveryMethod: transformDeliveryMethodToDatabaseType(
            dataFromNoris.delivery_method,
          ),
        },
      })
      const taxInstallments =
        dataFromNoris.SPL4_2 === ''
          ? [
              {
                taxId: tax.id,
                amount: currency(dataFromNoris.SPL1.replace(',', '.')).intValue,
                text: dataFromNoris.TXTSPL1,
              },
            ]
          : [
              {
                taxId: tax.id,
                amount: currency(dataFromNoris.SPL4_1.replace(',', '.'))
                  .intValue,
                text: dataFromNoris.TXTSPL4_1,
              },
              {
                taxId: tax.id,
                amount: currency(dataFromNoris.SPL4_2.replace(',', '.'))
                  .intValue,
                text: dataFromNoris.TXTSPL4_2,
              },
              {
                taxId: tax.id,
                amount: currency(dataFromNoris.SPL4_3.replace(',', '.'))
                  .intValue,
                text: dataFromNoris.TXTSPL4_3,
              },
            ]
      await tx.taxInstallment.createMany({
        data: taxInstallments,
      })

      const taxDetailData = taxDetail(dataFromNoris, tax.id)

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

    await Promise.all(
      norisData.map(async (norisItem) => {
        birthNumbersResult.push(norisItem.ICO_RC)
        const taxExists = await this.prismaService.tax.findFirst({
          where: {
            year: +year,
            taxPayer: {
              birthNumber: norisItem.ICO_RC,
            },
          },
        })
        if (!taxExists) {
          const userData = await this.insertTaxPayerDataToDatabase(
            norisItem,
            year,
          )
          const userFromCityAccount =
            userDataFromCityAccount[userData.birthNumber] || null
          if (userFromCityAccount !== null) {
            const bloomreachTracker =
              await this.bloomreachService.trackEventTax(
                {
                  amount: currency(norisItem.dan_spolu.replace(',', '.'))
                    .intValue,
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
          }
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
    const norisData = await this.norisService.getDataFromNoris(data)
    let count = 0
    await Promise.all(
      norisData.map(async (norisItem) => {
        const taxExists = await this.prismaService.tax.findFirst({
          where: {
            year: +data.year,
            taxPayer: {
              birthNumber: norisItem.ICO_RC,
            },
          },
        })
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

  private async getTaxesDataMap(norisPaymentData: Partial<NorisPaymentsDto>[]) {
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
      : currency(amount.replace(',', '.')).intValue
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

  async updatePaymentsFromNorisWithData(
    norisPaymentData: Partial<NorisPaymentsDto>[],
  ) {
    let created = 0
    let alreadyCreated = 0
    const taxesDataMap = await this.getTaxesDataMap(norisPaymentData)

    // Get all tax IDs from taxesDataMap
    const taxIds = [...taxesDataMap.values()].map((tax) => tax.id)

    // Get aggregate data for all taxes at once
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
    const aggregateDataMap = new Map(
      aggregateData.map((data) => [
        data.taxId,
        {
          sum: data._sum.amount || 0,
          count: data._count._all,
        },
      ]),
    )

    // Get batch data from city account
    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        [...taxesDataMap.values()].map(
          (taxData) => taxData.taxPayer.birthNumber,
        ),
      )

    // despite the retype, do not trust the data from Noris & approach as if they were all optional
    await Promise.all(
      norisPaymentData
        .filter((norisPayment) => {
          return (
            norisPayment.variabilny_symbol !== undefined &&
            norisPayment.uhrazeno !== undefined &&
            norisPayment.zbyva_uhradit !== undefined
          )
        })
        .map(async (norisPayment) => {
          try {
            const taxData = taxesDataMap.get(norisPayment.variabilny_symbol!) // we know it's not undefined from filter
            if (taxData) {
              const payerData = aggregateDataMap.get(taxData.id) || {
                sum: 0,
                count: 0,
              }
              const paidFromNoris = this.formatAmount(norisPayment.uhrazeno!) // we know it's not undefined from filter
              const forPayment = this.formatAmount(norisPayment.zbyva_uhradit!) // we know it's not undefined from filter

              if (payerData.sum === null || payerData.sum < paidFromNoris) {
                created += 1
                const createdTaxPayment =
                  await this.prismaService.taxPayment.create({
                    data: {
                      amount: paidFromNoris - (payerData.sum ?? 0),
                      source: 'BANK_ACCOUNT',
                      specificSymbol: norisPayment.specificky_symbol,
                      taxId: taxData.id,
                      status: PaymentStatus.SUCCESS,
                    },
                  })
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

                this.handlePaymentsErrors(
                  paidFromNoris,
                  taxData,
                  forPayment,
                  payerData.count,
                )
              } else {
                alreadyCreated += 1
              }
            }
          } catch (error) {
            this.logger.error(
              this.throwerErrorGuard.InternalServerErrorException(
                ErrorsEnum.INTERNAL_SERVER_ERROR,
                ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
                undefined,
                undefined,
                error as Error,
              ),
            )
          }
        }),
    )

    return {
      created,
      alreadyCreated,
    }
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
      if (methodInfo.deliveryMethod in deliveryGroups) {
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
      }
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

  async updateTaxesFromNoris(taxes: TaxIdVariableSymbol[]): Promise<void> {
    const variableSymbolToId = new Map(
      taxes.map((tax) => [tax.variableSymbol, tax.id]),
    )
    const variableSymbols = [...variableSymbolToId.keys()]
    const data = await this.norisService.getDataForUpdate(variableSymbols)
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

  async deleteTestingTax({
    year,
    birthNumber,
  }: RequestAdminDeleteTaxDto): Promise<void> {
    const taxPayer = await this.prismaService.taxPayer.findUnique({
      where: {
        birthNumber,
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

    await this.prismaService.taxPayment.deleteMany({
      where: {
        taxId: tax.id,
      },
    })
    await this.prismaService.taxInstallment.deleteMany({
      where: {
        taxId: tax.id,
      },
    })
    await this.prismaService.taxDetail.deleteMany({
      where: {
        taxId: tax.id,
      },
    })
    await this.prismaService.tax.delete({
      where: {
        taxPayerId_year: {
          taxPayerId: taxPayer.id,
          year,
        },
      },
    })
  }

  async bloomreachCustomerEventTaxPayment({
    bloomreachData,
    birthNumber,
  }: RequestAdminBloomreachCustomerEventTaxPaymentDto): Promise<void> {
    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdmin(birthNumber)

    if (!userDataFromCityAccount) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Tax payer not found',
      )
    }
    if (!userDataFromCityAccount.externalId) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Tax payer external id not found',
      )
    }

    await this.bloomreachService.trackEventTaxPayment(
      {
        year: bloomreachData.year,
        amount: bloomreachData.amount,
        payment_source: bloomreachData.payment_source,
      },
      userDataFromCityAccount.externalId,
    )
  }
}
