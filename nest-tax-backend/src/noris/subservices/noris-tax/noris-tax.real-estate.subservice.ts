import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import * as mssql from 'mssql'
import pLimit from 'p-limit'

import { CreateBirthNumbersResponseDto } from '../../../admin/dtos/responses.dto'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
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
export class NorisTaxRealEstateSubservice extends AbstractNorisTaxSubservice {
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
  ) {
    const logger = new LineLoggerSubservice(NorisTaxRealEstateSubservice.name)
    super(
      qrCodeSubservice,
      prismaService,
      bloomreachService,
      throwerErrorGuard,
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
  ): Promise<CreateBirthNumbersResponseDto> {
    this.logger.log('Start Loading data from noris')
    const norisData = await this.getTaxDataByYearAndBirthNumber(
      year,
      birthNumbers,
    )

    const birthNumbersResult: string[] = await this.processNorisTaxData(
      norisData,
      year,
    )

    return { birthNumbers: birthNumbersResult }
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

    await Promise.all(
      norisDataNotInDatabase.map(async (norisItem) =>
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

    // Add the payments for these added taxes to database
    await this.paymentSubservice.updatePaymentsFromNorisWithData(norisData)

    return [...birthNumbersResult]
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
