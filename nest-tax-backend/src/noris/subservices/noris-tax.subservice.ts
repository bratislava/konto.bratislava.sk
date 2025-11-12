import { Injectable } from '@nestjs/common'
import { Prisma, TaxType } from '@prisma/client'
import * as mssql from 'mssql'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'
import pLimit from 'p-limit'

import { RequestPostNorisLoadDataDto } from '../../admin/dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from '../../admin/dtos/responses.dto'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PrismaService } from '../../prisma/prisma.service'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import { CustomErrorNorisTypesEnum } from '../noris.errors'
import {
  BaseNorisCommunalWasteTaxSchema,
  NorisRawCommunalWasteTaxSchema,
  NorisRealEstateTaxSchema,
} from '../types/noris.schema'
import {
  BaseNorisCommunalWasteTaxDto,
  NorisCommunalWasteTaxGrouped,
  NorisRawCommunalWasteTax,
  NorisRealEstateTax,
} from '../types/noris.types'
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
  queryPayersFromNoris,
} from '../utils/noris.queries'
import { NorisConnectionSubservice } from './noris-connection.subservice'
import { NorisPaymentSubservice } from './noris-payment.subservice'
import { NorisValidatorSubservice } from './noris-validator.subservice'

@Injectable()
export class NorisTaxSubservice {
  private readonly logger = new LineLoggerSubservice('NorisTaxSubservice')

  private readonly concurrency = Number(process.env.DB_CONCURRENCY ?? 10)

  private readonly concurrencyLimit = pLimit(this.concurrency)

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly paymentSubservice: NorisPaymentSubservice,
    private readonly prismaService: PrismaService,
    private readonly bloomreachService: BloomreachService,
    private readonly qrCodeSubservice: QrCodeSubservice,
    private readonly norisValidatorSubservice: NorisValidatorSubservice,
  ) {}

  private async getTaxDataByYearAndBirthNumber(
    data: RequestPostNorisLoadDataDto,
  ): Promise<NorisRealEstateTax[]> {
    const norisData = await this.connectionService.withConnection(
      async (connection) => {
        const request = new mssql.Request(connection)

        request.input('year', mssql.Int, data.year)
        const birthNumbersPlaceholders = data.birthNumbers
          .map((_, index) => `@birth_number${index}`)
          .join(',')
        data.birthNumbers.forEach((birthNumber, index) => {
          request.input(`birth_number${index}`, mssql.VarChar(20), birthNumber)
        })

        return request.query(
          queryPayersFromNoris.replaceAll(
            '@birth_numbers',
            birthNumbersPlaceholders,
          ),
        )
      },
      (error) => {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to get taxes from Noris',
          undefined,
          error instanceof Error ? undefined : <string>error,
          error instanceof Error ? error : undefined,
        )
      },
    )
    return this.norisValidatorSubservice.validateNorisData(
      NorisRealEstateTaxSchema,
      norisData.recordset,
    )
  }

  async getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    data: RequestPostNorisLoadDataDto,
  ) {
    let norisData: NorisRealEstateTax[]
    try {
      norisData = await this.getTaxDataByYearAndBirthNumber(data)
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
      norisData.map(async (norisItem) =>
        this.concurrencyLimit(async () => {
          const taxExists = birthNumberToTax.get(norisItem.ICO_RC)
          if (!taxExists) {
            return
          }
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
        }),
      ),
    )

    return { updated: count }
  }

  async processNorisTaxData(
    norisData: NorisRealEstateTax[],
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

    const norisDataNotInDatabase = norisData.filter(
      (norisItem) => !birthNumbersWithExistingTax.has(norisItem.ICO_RC),
    )

    await Promise.all(
      norisDataNotInDatabase.map(async (norisItem) =>
        this.concurrencyLimit(async () => {
          await this.processTaxRecordFromNoris(
            birthNumbersResult,
            norisItem,
            userDataFromCityAccount,
            year,
          )
        }),
      ),
    )

    // Add the payments for these added taxes to database
    await this.paymentSubservice.updatePaymentsFromNorisWithData(norisData)

    return [...birthNumbersResult]
  }

  private readonly processTaxRecordFromNoris = async (
    birthNumbersResult: Set<string>,
    norisItem: NorisRealEstateTax,
    userDataFromCityAccount: Record<string, ResponseUserByBirthNumberDto>,
    year: number,
  ) => {
    birthNumbersResult.add(norisItem.ICO_RC)

    try {
      await this.prismaService.$transaction(async (tx) => {
        const userFromCityAccount =
          userDataFromCityAccount[norisItem.ICO_RC] || null

        if (!userFromCityAccount) {
          return
        }

        const userData = await this.insertTaxPayerDataToDatabase(
          norisItem,
          year,
          tx,
          userFromCityAccount,
        )

        const bloomreachTracker = await this.bloomreachService.trackEventTax(
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
  }

  async getAndProcessNorisTaxDataByBirthNumberAndYear(
    data: RequestPostNorisLoadDataDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    this.logger.log('Start Loading data from noris')
    const norisData = await this.getTaxDataByYearAndBirthNumber(data)

    const birthNumbersResult: string[] = await this.processNorisTaxData(
      norisData,
      data.year,
    )

    return { birthNumbers: birthNumbersResult }
  }

  private async insertTaxPayerDataToDatabase(
    dataFromNoris: NorisRealEstateTax,
    year: number,
    transaction: Prisma.TransactionClient,
    userDataFromCityAccount: ResponseUserByBirthNumberDto | null,
  ) {
    const taxAdministratorData = mapNorisToTaxAdministratorData(dataFromNoris)
    const taxAdministrator = taxAdministratorData
      ? await transaction.taxAdministrator.upsert({
          where: {
            id: taxAdministratorData.id,
          },
          create: taxAdministratorData,
          update: taxAdministratorData,
        })
      : undefined

    const taxPayerData = mapNorisToTaxPayerData(dataFromNoris, taxAdministrator)
    const taxPayer = await transaction.taxPayer.upsert({
      where: {
        birthNumber: dataFromNoris.ICO_RC,
      },
      create: taxPayerData,
      update: taxPayerData,
    })

    // deliveryMethod is missing here, since we do not want to update
    // historical taxes with the current delivery method in Noris
    const taxData = mapNorisToTaxData(dataFromNoris, year, taxPayer.id)
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
        type: TaxType.DZN,
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

  /**
   * Fetches communal waste tax data from Noris for given birth numbers and year.
   *
   * @remarks
   * ⚠️ **Warning:** This returns a record for each communal waste container.
   * The data must be grouped by variable symbol, so we process only one record internally, with all containers
   * for one person as one record.
   *
   * @param data List of birth numbers and year to fetch data for.
   * @returns An array of records for given birth numbers and year.
   */
  private async getCommunalWasteTaxDataByBirthNumberAndYear(
    data: RequestPostNorisLoadDataDto,
  ): Promise<NorisRawCommunalWasteTax[]> {
    const norisData = await this.connectionService.withConnection(
      async (connection) => {
        const request = new mssql.Request(connection)

        const birthNumbersPlaceholders = data.birthNumbers
          .map((_, index) => `@birth_number${index}`)
          .join(',')
        data.birthNumbers.forEach((birthNumber, index) => {
          request.input(`birth_number${index}`, mssql.VarChar(20), birthNumber)
        })
        request.input('year', mssql.Int, data.year)

        const queryWithPlaceholders = getCommunalWasteTaxesFromNoris.replaceAll(
          '@birth_numbers',
          birthNumbersPlaceholders,
        )

        return request.query(queryWithPlaceholders)
      },
      (error) => {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to get communal waste tax data from Noris',
          undefined,
          error instanceof Error ? undefined : <string>error,
          error instanceof Error ? error : undefined,
        )
      },
    )
    return this.norisValidatorSubservice.validateNorisData(
      NorisRawCommunalWasteTaxSchema,
      norisData.recordset,
    )
  }

  processWasteTaxRecords(
    records: NorisRawCommunalWasteTax[],
  ): NorisCommunalWasteTaxGrouped[] {
    const grouped: Record<string, NorisRawCommunalWasteTax[]> = {}

    records.forEach((rec) => {
      if (!grouped[rec.variabilny_symbol]) {
        grouped[rec.variabilny_symbol] = []
      }
      grouped[rec.variabilny_symbol].push(rec)
    })

    const result: NorisCommunalWasteTaxGrouped[] = []

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

      // Get all keys from BaseNorisCommunalWasteTaxDto
      const baseKeys = Object.keys(
        BaseNorisCommunalWasteTaxSchema.shape,
      ) as (keyof BaseNorisCommunalWasteTaxDto)[]

      const baseData = Object.fromEntries(
        baseKeys.map((key) => [key, base[key]]),
      ) as BaseNorisCommunalWasteTaxDto

      const groupedData: NorisCommunalWasteTaxGrouped = {
        ...baseData,
        containers,
      }

      result.push(groupedData)
    })

    return result
  }
}
