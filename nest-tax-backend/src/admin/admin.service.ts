import { Injectable, Logger } from '@nestjs/common'
import { PaymentStatus, Tax } from '@prisma/client'
import currency from 'currency.js'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { NorisPaymentsDto, NorisTaxPayersDto } from '../noris/noris.dto'
import { NorisService } from '../noris/noris.service'
import { PrismaService } from '../prisma/prisma.service'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'
import {
  NorisRequestGeneral,
  RequestPostNorisLoadDataDto,
} from './dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from './dtos/responses.dto'
import { taxDetail } from './utils/tax-detail.helper'

@Injectable()
export class AdminService {
  private readonly logger: Logger

  constructor(
    private prismaService: PrismaService,
    private qrCodeSubservice: QrCodeSubservice,
    private cityAccountSubservice: CityAccountSubservice,
    private bloomreachService: BloomreachService,
    private norisService: NorisService,
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
          taxId: dataFromNoris.cislo_konania,
          taxLand: currency(dataFromNoris.dan_pozemky.replace(',', '.'))
            .intValue,
          taxConstructions: currency(
            dataFromNoris.dan_stavby_SPOLU.replace(',', '.'),
          ).intValue,
          taxFlat: currency(dataFromNoris.dan_byty.replace(',', '.')).intValue,
          qrCodeEmail,
          qrCodeWeb,
        },
        create: {
          amount: currency(dataFromNoris.dan_spolu.replace(',', '.')).intValue,
          year,
          taxEmployeeId: taxEmployee.id,
          taxPayerId: taxPayer.id,
          variableSymbol: dataFromNoris.variabilny_symbol,
          dateCreateTax: dataFromNoris.akt_datum,
          taxId: dataFromNoris.cislo_konania,
          taxLand: currency(dataFromNoris.dan_pozemky.replace(',', '.'))
            .intValue,
          taxConstructions: currency(
            dataFromNoris.dan_stavby_SPOLU.replace(',', '.'),
          ).intValue,
          taxFlat: currency(dataFromNoris.dan_byty.replace(',', '.')).intValue,
          qrCodeEmail,
          qrCodeWeb,
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

    return { userData, dataFromNoris }
  }

  async loadDataFromNoris(
    data: RequestPostNorisLoadDataDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    this.logger.log('Start Loading data from noris')
    const norisData = (await this.norisService.getDataFromNoris(
      data,
    )) as NorisTaxPayersDto[]
    const birthNumbersResult: string[] = []

    this.logger.log(`Data loaded from noris - count ${norisData.length}`)

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        norisData.map((norisRecord) => norisRecord.ICO_RC),
      )

    await Promise.all(
      norisData.map(async (elem) => {
        birthNumbersResult.push(elem.ICO_RC)
        const taxExists = await this.prismaService.tax.findFirst({
          where: {
            year: +data.year,
            taxPayer: {
              birthNumber: elem.ICO_RC,
            },
          },
        })
        if (!taxExists) {
          const { userData, dataFromNoris } =
            await this.insertTaxPayerDataToDatabase(elem, data.year)
          const userFromCityAccount =
            userDataFromCityAccount[userData.birthNumber] || null
          if (userFromCityAccount !== null) {
            const bloomreachTracker =
              await this.bloomreachService.trackEventTax(
                {
                  amount: currency(dataFromNoris.dan_spolu.replace(',', '.'))
                    .intValue,
                  year: +data.year,
                },
                userFromCityAccount.externalId ?? undefined,
              )
            if (!bloomreachTracker) {
              this.logger.error(
                `ERROR - Status-500: Error in send Tax data to Bloomreach for tax payer with ID ${userData.id} and year ${data.year}`,
              )
            }
          }
        }
      }),
    )

    return { birthNumbers: birthNumbersResult }
  }

  async updateDataFromNoris(data: RequestPostNorisLoadDataDto) {
    const norisData = await this.norisService.getDataFromNoris(data)
    let count = 0
    await Promise.all(
      norisData.map(async (elem) => {
        const taxExists = await this.prismaService.tax.findFirst({
          where: {
            year: +data.year,
            taxPayer: {
              birthNumber: elem.ICO_RC,
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
            elem,
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
   * @param payedFromNoris Already paid amount in Noris.
   * @param taxData Tax object, containing all the information about the tax.
   * @param forPayment Left to be paid amount in Noris.
   * @param payerDataCountAll How many payments for this tax we have in the database.
   */
  private handlePaymentsErrors(
    payedFromNoris: number,
    taxData: Tax,
    forPayment: number,
    payerDataCountAll: number,
  ) {
    if (payedFromNoris > taxData.amount && forPayment === 0) {
      this.logger.error(
        'ERROR - Status-500: ZAPLATENE VSETKO ALE V NORISE JE VACSIA CIASTKA AKO U NAS',
      )
    } else if (
      payerDataCountAll === 0 &&
      payedFromNoris >= taxData.amount &&
      forPayment > 0
    ) {
      this.logger.error(
        'ERROR - Status-500: U NAS ZAPLATENE VSETKO ALE V NORISE NIE - na 1x',
      )
    } else if (
      payerDataCountAll > 0 &&
      payedFromNoris >= taxData.amount &&
      forPayment > 0
    ) {
      this.logger.error(
        'ERROR - Status-500: U NAS ZAPLATENE VSETKO ALE V NORISE NIE - na x krat',
      )
    }
  }

  async updatePaymentsFromNoris(norisRequest: NorisRequestGeneral) {
    let created = 0
    let alreadyCreated = 0
    const norisPaymentData: Partial<NorisPaymentsDto>[] =
      norisRequest.type === 'fromToDate'
        ? await this.norisService.getPaymentDataFromNoris(norisRequest.data)
        : await this.norisService.getPaymentDataFromNorisByVariableSymbols(
            norisRequest.data,
          )
    const taxesDataMap = await this.getTaxesDataMap(norisPaymentData)

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
              const payerData = await this.prismaService.taxPayment.aggregate({
                _sum: {
                  amount: true,
                },
                _count: {
                  _all: true,
                },
                where: {
                  taxId: taxData.id,
                  status: PaymentStatus.SUCCESS,
                },
              })
              const payedFromNoris =
                typeof norisPayment.uhrazeno === 'number'
                  ? currency(norisPayment.uhrazeno).intValue
                  : currency(norisPayment.uhrazeno!.replace(',', '.')).intValue // we know it's not undefined from filter
              const forPayment =
                typeof norisPayment.zbyva_uhradit === 'number'
                  ? currency(norisPayment.zbyva_uhradit).intValue
                  : currency(norisPayment.zbyva_uhradit!.replace(',', '.')) // we know it's not undefined from filter
                      .intValue
              if (
                payerData._sum.amount === null ||
                payerData._sum.amount < payedFromNoris
              ) {
                created += 1
                const createdTaxPayment =
                  await this.prismaService.taxPayment.create({
                    data: {
                      amount: payedFromNoris - (payerData._sum.amount ?? 0),
                      source: 'BANK_ACCOUNT',
                      specificSymbol: norisPayment.specificky_symbol,
                      taxId: taxData.id,
                      status: PaymentStatus.SUCCESS,
                    },
                  })
                const userFromCityAccount =
                  await this.cityAccountSubservice.getUserDataAdmin(
                    taxData.taxPayer.birthNumber,
                  )
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
                  payedFromNoris,
                  taxData,
                  forPayment,
                  payerData._count._all,
                )
              } else {
                alreadyCreated += 1
              }
            }
          } catch (error) {
            this.logger.error(`ERROR - Status-500: ${(error as Error).message}`)
          }
        }),
    )

    return {
      created,
      alreadyCreated,
    }
  }

  /**
   * Adds birth numbers to the taxpayer table in the database from Noris. The birth numbers must include a slash.
   *
   * First, the function checks which birth numbers are already in the database. Then, it attempts to add the remaining birth numbers from Noris.
   *
   * @param {string[]} birthNumbers - A list of birth numbers in the format with a slash, which should be added from Noris to the taxpayer table if they are not already present.
   * @returns {string[]} A list of birth numbers that were either already in the taxpayer table or were successfully added from Noris.
   */
  async createTaxPayers(
    birthNumbers: string[],
  ): Promise<CreateBirthNumbersResponseDto> {
    const birthNumbersResult: string[] = []
    const taxPayersAlreadyInDb = await this.prismaService.taxPayer.findMany({
      select: {
        birthNumber: true,
      },
      where: {
        birthNumber: {
          in: birthNumbers,
        },
      },
    })
    birthNumbersResult.push(
      ...taxPayersAlreadyInDb.map(
        (birthNumberRow) => birthNumberRow.birthNumber,
      ),
    )

    const birthNumbersCreatedFromNoris = await this.loadDataFromNoris({
      birthNumbers: birthNumbers.filter(
        (item) => !birthNumbersResult.includes(item),
      ),
      year: new Date().getFullYear(),
    })
    birthNumbersResult.push(...birthNumbersCreatedFromNoris.birthNumbers)

    return { birthNumbers: [...new Set(birthNumbersResult)] }
  }
}
