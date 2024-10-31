/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Injectable } from '@nestjs/common'
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
  constructor(
    private prismaService: PrismaService,
    private qrCodeSubservice: QrCodeSubservice,
    private cityAccountSubservice: CityAccountSubservice,
    private bloomreachService: BloomreachService,
    private norisService: NorisService,
  ) {}

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
    console.info('Start Loading data from noris')
    const norisData = (await this.norisService.getDataFromNoris(
      data,
    )) as NorisTaxPayersDto[]
    const birthNumbersResult: string[] = []

    console.info(`Data loaded from noris - count ${norisData.length}`)

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        norisData.map((norisRecord) => norisRecord.ICO_RC),
      )

    for (const elem of norisData) {
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
          const bloomreachTracker = await this.bloomreachService.trackEventTax(
            {
              amount: currency(dataFromNoris.dan_spolu.replace(',', '.'))
                .intValue,
              year: +data.year,
            },
            userFromCityAccount.externalId,
          )
          if (!bloomreachTracker) {
            console.error(
              `Error in send Tax data to Bloomreach for tax with ID ${taxExists.id}`,
            )
          }
        }
      }
    }
    return { birthNumbers: birthNumbersResult }
  }

  async updateDataFromNoris(data: RequestPostNorisLoadDataDto) {
    const norisData = await this.norisService.getDataFromNoris(data)
    let count = 0
    for (const elem of norisData as NorisTaxPayersDto[]) {
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
    }
    return { updated: count }
  }

  async updatePaymentsFromNoris(norisRequest: NorisRequestGeneral) {
    let created = 0
    let alreadyCreated = 0
    // despite the retype, do not trust the data from Noris & approach as if they were all optional
    const norisPaymentData: Partial<NorisPaymentsDto>[] =
      norisRequest.type === 'fromToDate'
        ? await this.norisService.getPaymentDataFromNoris(norisRequest.data)
        : await this.norisService.getPaymentDataFromNorisByVariableSymbols(
            norisRequest.data,
          )

    if (norisPaymentData.some((item) => !item.hasOwnProperty('ICO_RC'))) {
      console.error('ERROR - Status-500: ICO_RC is missing')
      return {
        created: 0,
        alreadyCreated: 0,
      }
    }
    const usersCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        norisPaymentData.map((norisRecord) => norisRecord.ICO_RC),
      )

    const taxDataArray = await this.prismaService.tax.findMany({
      where: {
        variableSymbol: {
          in: norisPaymentData.map(
            (norisRecord) => norisRecord.variabilny_symbol,
          ),
        },
      },
      include: {
        taxPayer: true,
      },
    })
    const taxDataForVariableSymbols = new Map(
      taxDataArray.map((taxData) => [taxData.variableSymbol, taxData]),
    )
    norisPaymentData.forEach(async (norisPayment) => {
      const taxData = taxDataForVariableSymbols.get(
        norisPayment.variabilny_symbol,
      )
      if (!taxData) {
        return
      }

      const payerData = await this.prismaService.taxPayment.aggregate({
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
        where: {
          taxId: taxData.id,
          status: 'SUCCESS',
        },
      })
      const payedFromNoris =
        typeof norisPayment.uhrazeno === 'number'
          ? currency(norisPayment.uhrazeno).intValue
          : currency(norisPayment.uhrazeno.replace(',', '.')).intValue
      const forPayment =
        typeof norisPayment.uhrazeno === 'number'
          ? currency(norisPayment.zbyva_uhradit).intValue
          : currency(norisPayment.zbyva_uhradit.replace(',', '.')).intValue
      if (
        payerData._sum.amount === null ||
        payerData._sum.amount < payedFromNoris
      ) {
        created += 1
        const createdTaxPayment = await this.prismaService.taxPayment.create({
          data: {
            amount: payedFromNoris - payerData._sum.amount,
            source: 'BANK_ACCOUNT',
            specificSymbol: norisPayment.specificky_symbol,
            taxId: taxData.id,
            status: 'SUCCESS',
          },
        })
        const userFromCityAccount =
          usersCityAccount[taxData.taxPayer.birthNumber] || null
        if (userFromCityAccount) {
          await this.bloomreachService.trackEventTaxPayment(
            {
              amount: createdTaxPayment.amount,
              payment_source: 'BANK_ACCOUNT',
              year: taxData.year,
            },
            userFromCityAccount.externalId,
          )
        }

        // TODO more refactor
        if (payedFromNoris > taxData.amount && forPayment === 0) {
          console.log(
            'ERROR - Status-500: ZAPLATENE VSETKO ALE V NORISE JE VACSIA CIASTKA AKO U NAS',
          )
        } else if (
          payerData._count._all === 0 &&
          payedFromNoris >= taxData.amount &&
          forPayment > 0
        ) {
          console.error(
            'ERROR - Status-500: U NAS ZAPLATENE VSETKO ALE V NORISE NIE - na 1x',
          )
        } else if (
          payerData._count._all > 0 &&
          payedFromNoris >= taxData.amount &&
          forPayment > 0
        ) {
          console.error(
            'ERROR - Status-500: U NAS ZAPLATENE VSETKO ALE V NORISE NIE - na x krat',
          )
        } else {
          console.error('ERROR - Status-500: NEOCAKAVANY STAV')
        }
      } else {
        alreadyCreated += 1
      }
    })

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
