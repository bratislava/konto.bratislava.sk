import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Request } from 'mssql'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'

import { RequestGetNorisTaxDataDto } from '../../admin/dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from '../../admin/dtos/responses.dto'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PrismaService } from '../../prisma/prisma.service'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import { TaxIdVariableSymbolYear } from '../../utils/types/types.prisma'
import {
  NorisCommunalWasteTaxDto,
  NorisCommunalWasteTaxProcessedDto,
  NorisTaxPayersDto,
  NorisUpdateDto,
} from '../noris.dto'
import { CustomErrorNorisTypesEnum } from '../noris.errors'
import {
  convertCurrencyToInt,
  mapNorisToTaxAdministratorData,
  mapNorisToTaxData,
  mapNorisToTaxDetailData,
  mapNorisToTaxInstallmentsData,
  mapNorisToTaxPayerData,
} from '../utils/mapping.helper'
import {
  getCommunalWasteTaxesFromNoris,
  getNorisDataForUpdate,
  queryPayersFromNoris,
} from '../utils/noris.queries'
import { NorisConnectionSubservice } from './noris-connection.subservice'
import { NorisPaymentSubservice } from './noris-payment.subservice'

@Injectable()
export class NorisTaxSubservice {
  private readonly logger = new LineLoggerSubservice('NorisTaxSubservice')

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly paymentSubservice: NorisPaymentSubservice,
    private readonly prismaService: PrismaService,
    private readonly bloomreachService: BloomreachService,
    private readonly qrCodeSubservice: QrCodeSubservice,
  ) {}

  private async getTaxDataByYearAndBirthNumber(
    data: RequestGetNorisTaxDataDto,
  ): Promise<NorisTaxPayersDto[]> {
    const connection = await this.connectionService.createConnection()

    let birthNumbers = ''
    data.birthNumbers.forEach((birthNumber) => {
      birthNumbers += `'${birthNumber}',`
    })
    if (birthNumbers.length > 0) {
      birthNumbers = `AND lcs.dane21_priznanie.rodne_cislo IN (${birthNumbers.slice(0, -1)})`
    }

    const norisData = await connection.query(
      queryPayersFromNoris
        .replaceAll('{%YEAR%}', data.year.toString())
        .replaceAll('{%BIRTHNUMBERS%}', birthNumbers),
    )
    connection.close()
    return norisData.recordset
  }

  async getDataForUpdate(
    variableSymbols: string[],
    years: number[],
  ): Promise<NorisUpdateDto[]> {
    const connection = await this.connectionService.createOptimizedConnection()

    try {
      // Wait for connection to be fully established
      await this.connectionService.waitForConnection(connection)

      const request = new Request(connection)

      const variableSymbolsPlaceholders = variableSymbols
        .map((_, index) => `@variablesymbol${index}`)
        .join(',')
      variableSymbols.forEach((variableSymbol, index) => {
        request.input(`variablesymbol${index}`, variableSymbol)
      })

      const yearsPlaceholders = years
        .map((_, index) => `@year${index}`)
        .join(',')
      years.forEach((year, index) => {
        request.input(`year${index}`, year)
      })

      const queryWithPlaceholders = getNorisDataForUpdate
        .replaceAll('@variable_symbols', variableSymbolsPlaceholders)
        .replaceAll('@years', yearsPlaceholders)

      const norisData = await request.query(queryWithPlaceholders)
      return norisData.recordset
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Failed to get data from Noris during tax update`,
        undefined,
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
      )
    } finally {
      // Always close the connection
      await connection.close()
    }
  }

  async getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    data: RequestGetNorisTaxDataDto,
  ) {
    let norisData: NorisTaxPayersDto[]
    try {
      norisData = (await this.getTaxDataByYearAndBirthNumber(
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

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        norisData.map((norisRecord) => norisRecord.ICO_RC),
      )

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
          try {
            await this.prismaService.$transaction(async (tx) => {
              await tx.taxInstallment.deleteMany({
                where: {
                  taxId: taxExists.id,
                },
              })
              await tx.taxDetail.deleteMany({
                where: {
                  taxId: taxExists.id,
                },
              })

              const userFromCityAccount =
                userDataFromCityAccount[norisItem.ICO_RC] || null

              const userData = await this.insertTaxPayerDataToDatabase(
                norisItem,
                data.year,
                tx,
                userFromCityAccount,
              )
              if (userData) {
                count += 1
              }
            })
          } catch (error) {
            this.logger.error(
              this.throwerErrorGuard.InternalServerErrorException(
                ErrorsEnum.INTERNAL_SERVER_ERROR,
                'Failed to update tax in database.',
                undefined,
                undefined,
                error,
              ),
            )
          }
        }
      }),
    )

    return { updated: count }
  }

  async processNorisTaxData(
    norisData: NorisTaxPayersDto[],
    year: number,
  ): Promise<string[]> {
    const birthNumbersResult: Set<string> = new Set()

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
        birthNumbersResult.add(norisItem.ICO_RC)

        const taxExists = birthNumbersWithExistingTax.has(norisItem.ICO_RC)
        if (taxExists) {
          return
        }

        try {
          await this.prismaService.$transaction(async (tx) => {
            const userFromCityAccount =
              userDataFromCityAccount[norisItem.ICO_RC] || null

            const userData = await this.insertTaxPayerDataToDatabase(
              norisItem,
              year,
              tx,
              userFromCityAccount,
            )

            if (userFromCityAccount) {
              const bloomreachTracker =
                await this.bloomreachService.trackEventTax(
                  {
                    amount: convertCurrencyToInt(norisItem.dan_spolu),
                    year,
                    delivery_method:
                      userFromCityAccount.taxDeliveryMethodAtLockDate ?? null,
                  },
                  userFromCityAccount.externalId ?? undefined,
                )
              if (!bloomreachTracker) {
                throw this.throwerErrorGuard.InternalServerErrorException(
                  ErrorsEnum.INTERNAL_SERVER_ERROR,
                  `Error in send Tax data to Bloomreach for tax payer with ID ${userData.id} and year ${year}`,
                )
              }
            }
          })
        } catch (error) {
          this.logger.error(
            this.throwerErrorGuard.InternalServerErrorException(
              ErrorsEnum.INTERNAL_SERVER_ERROR,
              'Failed to insert tax to database.',
              undefined,
              undefined,
              error,
            ),
          )

          // Remove the birth number from the result set if insertion fails
          birthNumbersResult.delete(norisItem.ICO_RC)
        }
      }),
    )

    // Add the payments for these added taxes to database
    await this.paymentSubservice.updatePaymentsFromNorisWithData(norisData)

    return [...birthNumbersResult]
  }

  async getAndProcessNorisTaxDataByBirthNumberAndYear(
    data: RequestGetNorisTaxDataDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    this.logger.log('Start Loading data from noris')
    const norisData = (await this.getTaxDataByYearAndBirthNumber(
      data,
    )) as NorisTaxPayersDto[]

    const birthNumbersResult: string[] = await this.processNorisTaxData(
      norisData,
      data.year,
    )

    return { birthNumbers: birthNumbersResult }
  }

  private async insertTaxPayerDataToDatabase(
    dataFromNoris: NorisTaxPayersDto,
    year: number,
    transaction: Prisma.TransactionClient,
    userDataFromCityAccount: ResponseUserByBirthNumberDto | null,
  ) {
    const taxAdministratorData = mapNorisToTaxAdministratorData(dataFromNoris)
    const taxAdministrator = await transaction.taxAdministrator.upsert({
      where: {
        id: dataFromNoris.vyb_id,
      },
      create: taxAdministratorData,
      update: taxAdministratorData,
    })

    const taxPayerData = mapNorisToTaxPayerData(dataFromNoris, taxAdministrator)
    const taxPayer = await transaction.taxPayer.upsert({
      where: {
        birthNumber: dataFromNoris.ICO_RC,
      },
      create: taxPayerData,
      update: taxPayerData,
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
    // historical taxes with the current delivery method in Noris
    const taxData = mapNorisToTaxData(
      dataFromNoris,
      year,
      taxPayer.id,
      qrCodeEmail,
      qrCodeWeb,
    )
    const tax = await transaction.tax.upsert({
      where: {
        taxPayerId_year: {
          taxPayerId: taxPayer.id,
          year,
        },
      },
      update: taxData,
      create: {
        ...taxData,
        deliveryMethod: userDataFromCityAccount?.taxDeliveryMethodAtLockDate,
      },
    })

    const taxInstallments = mapNorisToTaxInstallmentsData(dataFromNoris, tax.id)
    await transaction.taxInstallment.createMany({
      data: taxInstallments,
    })

    const taxDetailData = mapNorisToTaxDetailData(dataFromNoris, tax.id)

    await transaction.taxDetail.createMany({
      data: taxDetailData,
    })
    return taxPayer
  }

  async updateTaxesFromNoris(taxes: TaxIdVariableSymbolYear[]): Promise<void> {
    const variableSymbolToId = new Map(
      taxes.map((tax) => [tax.variableSymbol, tax.id]),
    )
    const variableSymbols = [...variableSymbolToId.keys()]
    const years = [...new Set(taxes.map((tax) => tax.year))]
    const data = await this.getDataForUpdate(variableSymbols, years)
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
   * Fetches communal waste tax data from Noris for given birth numbers and year.
   *
   * @remarks
   * ⚠️ **Warning:** This returns a record for each communal waste container.
   * The data must be grouped and processed by birth number, so we process only one record internally, with all containers for one person as one record.
   *
   * @param data List of birth numbers and year to fetch data for.
   * @returns An array of records for given birth numbers and year.
   */
  private async getCommunalWasteTaxDataByBirthNumberAndYear(
    data: RequestGetNorisTaxDataDto,
  ): Promise<NorisCommunalWasteTaxDto[]> {
    const connection = await this.connectionService.createConnection()

    try {
      // Wait for connection to be fully established
      await this.connectionService.waitForConnection(connection)

      const request = new Request(connection)

      const birthNumbersPlaceholders = data.birthNumbers
        .map((_, index) => `@birth_number${index}`)
        .join(',')
      data.birthNumbers.forEach((birthNumber, index) => {
        request.input(`birth_number${index}`, birthNumber)
      })
      request.input('year', data.year)

      const queryWithPlaceholders = getCommunalWasteTaxesFromNoris.replaceAll(
        '@variable_symbols',
        birthNumbersPlaceholders,
      )

      const norisData = await request.query(queryWithPlaceholders)
      return norisData.recordset
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Failed to get communal waste tax data from Noris`,
        undefined,
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
      )
    } finally {
      // Always close the connection
      await connection.close()
    }
  }

  processWasteTaxRecords(
    records: NorisCommunalWasteTaxDto[],
  ): NorisCommunalWasteTaxProcessedDto[] {
    const grouped: Record<string, NorisCommunalWasteTaxDto[]> = {}

    records.forEach((rec) => {
      if (!grouped[rec.ICO_RC]) {
        grouped[rec.ICO_RC] = []
      }
      grouped[rec.ICO_RC].push(rec)
    })

    const result: NorisCommunalWasteTaxProcessedDto[] = []

    Object.values(grouped).forEach((group) => {
      // Take the first record as "base" since all other fields are the same
      const base = group[0]

      const containers = group.map((r) => ({
        address: {
          street: r.ulica,
          orientationNumber: r.orientacne_cislo,
        },
        details: {
          objem_nadoby: r.objem_nadoby,
          pocet_nadob: r.pocet_nadob,
          pocet_odvozov: r.pocet_odvozov,
          sadzba: r.sadzba,
          poplatok: r.poplatok,
          druh_nadoby: r.druh_nadoby,
        },
      }))

      const processed: NorisCommunalWasteTaxProcessedDto = {
        ...base,
        containers,
      }

      // Remove the container-specific fields that are no longer part of the processed interface
      delete (processed as any).ulica
      delete (processed as any).orientacne_cislo
      delete (processed as any).objem_nadoby
      delete (processed as any).pocet_nadob
      delete (processed as any).pocet_odvozov
      delete (processed as any).sadzba
      delete (processed as any).poplatok
      delete (processed as any).druh_nadoby

      result.push(processed)
    })

    return result
  }
}
