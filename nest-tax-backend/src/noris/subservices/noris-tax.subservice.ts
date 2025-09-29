import { Injectable } from '@nestjs/common'
import { Prisma, TaxType } from '@prisma/client'
import { Request } from 'mssql'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'

import { RequestPostNorisLoadDataDto } from '../../admin/dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from '../../admin/dtos/responses.dto'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PrismaService } from '../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../tax-definitions/getTaxDefinitionByType'
import { TaxDefinition } from '../../tax-definitions/taxDefinitionsTypes'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import { TaxIdVariableSymbolYear } from '../../utils/types/types.prisma'
import { NorisTaxPayersDto, NorisUpdateDto } from '../noris.dto'
import { CustomErrorNorisTypesEnum } from '../noris.errors'
import {
  convertCurrencyToInt,
  mapNorisToTaxAdministratorData,
  mapNorisToTaxInstallmentsData,
  mapNorisToTaxPayerData,
} from '../utils/mapping.helper'
import {
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

  private async getRealEstateTaxDataByYearAndBirthNumber(
    data: RequestPostNorisLoadDataDto,
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

  async getRealEstateDataForUpdate(
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

  async getNorisRealEstateTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    data: RequestPostNorisLoadDataDto,
  ) {
    let norisData: NorisTaxPayersDto[]
    try {
      norisData = await this.getRealEstateTaxDataByYearAndBirthNumber(data)
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

    const taxDefinitionRealEstate = getTaxDefinitionByType(TaxType.DZN)
    if (!taxDefinitionRealEstate) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Tax definition for tax type ${TaxType.DZN} not found`,
      )
    }

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
        type: TaxType.DZN,
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
                taxDefinitionRealEstate,
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

  async processNorisRealEstateTaxData(
    norisData: NorisTaxPayersDto[],
    year: number,
  ): Promise<string[]> {
    const birthNumbersResult: Set<string> = new Set()

    this.logger.log(`Data loaded from noris - count ${norisData.length}`)

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        norisData.map((norisRecord) => norisRecord.ICO_RC),
      )

    const taxDefinitionRealEstate = getTaxDefinitionByType(TaxType.DZN)
    if (!taxDefinitionRealEstate) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Tax definition for tax type ${TaxType.DZN} not found`,
      )
    }

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
        type: TaxType.DZN,
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
              taxDefinitionRealEstate,
            )

            if (userFromCityAccount) {
              const bloomreachTracker =
                await this.bloomreachService.trackEventTax(
                  {
                    amount: convertCurrencyToInt(norisItem.dan_spolu),
                    year,
                    delivery_method:
                      userFromCityAccount.taxDeliveryMethodAtLockDate ?? null,
                    taxType: TaxType.DZN,
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

  async getAndProcessNorisRealEstateTaxDataByBirthNumberAndYear(
    data: RequestPostNorisLoadDataDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    this.logger.log('Start Loading data from noris')
    const norisData = await this.getRealEstateTaxDataByYearAndBirthNumber(data)

    const birthNumbersResult: string[] =
      await this.processNorisRealEstateTaxData(norisData, data.year)

    return { birthNumbers: birthNumbersResult }
  }

  private async insertTaxPayerDataToDatabase(
    dataFromNoris: NorisTaxPayersDto,
    year: number,
    transaction: Prisma.TransactionClient,
    userDataFromCityAccount: ResponseUserByBirthNumberDto | null,
    taxDefinition: TaxDefinition,
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
    const taxData = taxDefinition.mapNorisToTaxData(
      dataFromNoris,
      year,
      taxPayer.id,
      qrCodeEmail,
      qrCodeWeb,
    )
    const tax = await transaction.tax.upsert({
      where: {
        taxPayerId_year_type: {
          taxPayerId: taxPayer.id,
          year,
          type: taxDefinition.type,
        },
      },
      update: taxData,
      create: {
        ...taxData,
        type: TaxType.DZN,
        deliveryMethod: userDataFromCityAccount?.taxDeliveryMethodAtLockDate,
      },
    })

    const taxInstallments = mapNorisToTaxInstallmentsData(dataFromNoris, tax.id)
    await transaction.taxInstallment.createMany({
      data: taxInstallments,
    })

    const taxDetailData = taxDefinition.mapNorisToTaxDetailData(
      dataFromNoris,
      tax.id,
    )

    await transaction.taxDetail.createMany({
      data: taxDetailData,
    })
    return taxPayer
  }

  async updateTaxesFromNoris(
    taxes: TaxIdVariableSymbolYear[],
    type: TaxType,
  ): Promise<void> {
    const variableSymbolToId = new Map(
      taxes.map((tax) => [tax.variableSymbol, tax.id]),
    )
    const variableSymbols = [...variableSymbolToId.keys()]
    const years = [...new Set(taxes.map((tax) => tax.year))]

    const taxDefinition = getTaxDefinitionByType(type)
    if (!taxDefinition) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Tax definition for tax type ${type} not found`,
      )
    }

    const data = await this[taxDefinition.getDataForUpdate](
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
}
