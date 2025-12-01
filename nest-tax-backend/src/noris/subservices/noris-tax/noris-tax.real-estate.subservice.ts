import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import * as mssql from 'mssql'
import pLimit from 'p-limit'

import { RequestPostNorisLoadDataOptionsDto } from '../../../admin/dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from '../../../admin/dtos/responses.dto'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
import { CustomErrorNorisTypesEnum } from '../../noris.errors'
import { NorisRealEstateTaxSchema } from '../../types/noris.schema'
import { NorisRealEstateTax } from '../../types/noris.types'
import { queryPayersFromNoris } from '../../utils/noris.queries'
import { NorisConnectionSubservice } from '../noris-connection.subservice'
import { NorisPaymentSubservice } from '../noris-payment.subservice'
import { NorisValidatorSubservice } from '../noris-validator.subservice'
import { AbstractNorisTaxSubservice } from './noris-tax.subservice.abstract'

@Injectable()
export class NorisTaxRealEstateSubservice extends AbstractNorisTaxSubservice<
  typeof TaxType.DZN
> {
  private readonly concurrency = Number(process.env.DB_CONCURRENCY ?? 10)

  private readonly concurrencyLimit = pLimit(this.concurrency)

  constructor(
    private readonly connectionService: NorisConnectionSubservice,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly paymentSubservice: NorisPaymentSubservice,
    private readonly norisValidatorSubservice: NorisValidatorSubservice,

    throwerErrorGuard: ThrowerErrorGuard,
    bloomreachService: BloomreachService,
    qrCodeSubservice: QrCodeSubservice,
    prismaService: PrismaService,
    databaseSubservice: DatabaseSubservice,
  ) {
    const logger = new LineLoggerSubservice(NorisTaxRealEstateSubservice.name)
    super(
      qrCodeSubservice,
      prismaService,
      bloomreachService,
      throwerErrorGuard,
      databaseSubservice,
      logger,
    )
  }

  private async getTaxDataByYearAndBirthNumber(
    year: number,
    birthNumbers: string[],
  ): Promise<NorisRealEstateTax[]> {
    const norisData = await this.connectionService.withConnection(
      async (connection) => {
        const request = new mssql.Request(connection)

        request.input('year', mssql.Int, year)
        const birthNumbersPlaceholders = birthNumbers
          .map((_, index) => `@birth_number${index}`)
          .join(',')
        birthNumbers.forEach((birthNumber, index) => {
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

  async getAndProcessNorisTaxDataByBirthNumberAndYear(
    year: number,
    birthNumbers: string[],
    options: RequestPostNorisLoadDataOptionsDto = {},
  ): Promise<CreateBirthNumbersResponseDto> {
    this.logger.log('Start Loading data from noris')
    const norisData = await this.getTaxDataByYearAndBirthNumber(
      year,
      birthNumbers,
    )

    const birthNumbersResult = await this.processNorisTaxData(
      norisData,
      year,
      options,
    )

    // Include birth numbers found in Noris (regardless of whether they were processed)
    return {
      ...birthNumbersResult,
      foundInNoris: norisData.map((item) => item.ICO_RC),
    }
  }

  async processNorisTaxData(
    norisData: NorisRealEstateTax[],
    year: number,
    options: RequestPostNorisLoadDataOptionsDto = {},
  ): Promise<CreateBirthNumbersResponseDto> {
    const birthNumbersResult: Set<string> = new Set()
    const { prepareOnly = false, ignoreBatchLimit = false } = options

    this.logger.log(
      `Data loaded from noris - count ${norisData.length}, prepareOnly: ${prepareOnly}, ignoreBatchLimit: ${ignoreBatchLimit}`,
    )

    const taxDefinitionRealEstate = getTaxDefinitionByType(TaxType.DZN)

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

    const norisDataNotInDatabase = norisData.filter(
      (norisItem) => !birthNumbersWithExistingTax.has(norisItem.ICO_RC),
    )

    if (prepareOnly) {
      // In prepare mode, mark birth numbers as ready to import, and return them
      // No need to check for userFromCityAccount - that will be validated during actual import
      const birthNumbers = norisDataNotInDatabase.map(
        (norisItem) => norisItem.ICO_RC,
      )
      await this.prismaService.taxPayer.updateMany({
        where: {
          birthNumber: { in: birthNumbers },
        },
        data: { readyToImport: true },
      })
      return { birthNumbers }
    }

    // Normal mode: process and create taxes
    const batchSizeLimit = ignoreBatchLimit
      ? undefined
      : await this.getBatchSizeLimit()

    // Limit the number of records to process in this batch
    const recordsToProcess =
      batchSizeLimit === undefined
        ? norisDataNotInDatabase
        : norisDataNotInDatabase.slice(0, batchSizeLimit)

    if (
      batchSizeLimit !== undefined &&
      norisDataNotInDatabase.length > batchSizeLimit
    ) {
      this.logger.log(
        `Limiting batch processing to ${batchSizeLimit} records out of ${norisDataNotInDatabase.length} available`,
      )
    }

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        recordsToProcess.map((norisRecord) => norisRecord.ICO_RC),
      )

    await Promise.all(
      recordsToProcess.map(async (norisItem) =>
        this.concurrencyLimit(async () => {
          await this.processTaxRecordFromNoris(
            taxDefinitionRealEstate,
            birthNumbersResult,
            norisItem,
            userDataFromCityAccount,
            year,
          )
        }),
      ),
    )

    // Add the payments only for processed taxes
    await this.paymentSubservice.updatePaymentsFromNorisWithData(
      recordsToProcess,
    )

    return { birthNumbers: [...birthNumbersResult] }
  }

  async getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    year: number,
    birthNumbers: string[],
  ): Promise<{ updated: number }> {
    let norisData: NorisRealEstateTax[]
    try {
      norisData = await this.getTaxDataByYearAndBirthNumber(year, birthNumbers)
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
        year,
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

              const userFromCityAccount =
                userDataFromCityAccount[norisItem.ICO_RC] || null

              const tax = await this.insertTaxDataToDatabase(
                taxDefinitionRealEstate,
                norisItem,
                year,
                tx,
                userFromCityAccount,
              )
              if (tax) {
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
}
