import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import * as mssql from 'mssql'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'

import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
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
  constructor(
    private readonly connectionService: NorisConnectionSubservice,
    private readonly norisValidatorSubservice: NorisValidatorSubservice,

    throwerErrorGuard: ThrowerErrorGuard,
    bloomreachService: BloomreachService,
    qrCodeSubservice: QrCodeSubservice,
    prismaService: PrismaService,
    cityAccountSubservice: CityAccountSubservice,
    paymentSubservice: NorisPaymentSubservice,
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
      cityAccountSubservice,
      paymentSubservice,
    )
  }

  protected getTaxType(): typeof TaxType.DZN {
    return TaxType.DZN
  }

  private async updateExistingTaxRecord(
    taxDefinition: ReturnType<typeof this.getTaxDefinition>,
    norisItem: NorisRealEstateTax,
    taxId: number,
    year: number,
    userDataFromCityAccount: Record<string, ResponseUserByBirthNumberDto>,
  ): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      await tx.taxInstallment.deleteMany({
        where: {
          taxId,
        },
      })

      const userFromCityAccount =
        userDataFromCityAccount[norisItem.ICO_RC] || null

      await this.insertTaxDataToDatabase(
        taxDefinition,
        norisItem,
        year,
        tx,
        userFromCityAccount,
      )
    })
  }

  protected async getTaxDataByYearAndBirthNumber(
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

    const taxDefinition = this.getTaxDefinition()

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        norisData.map((norisRecord) => norisRecord.ICO_RC),
      )

    // Query existing taxes - use birthNumber for unique taxes (DZN is unique)
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
        taxPayer: {
          birthNumber: {
            in: norisData.map((norisRecord) => norisRecord.ICO_RC),
          },
        },
        year,
        type: this.getTaxType(),
      },
    })
    const taxIdentifierToTax = new Map(
      taxesExist.map((tax) => [tax.taxPayer.birthNumber, tax]),
    )

    const updateTaxRecord = async (
      norisItem: NorisRealEstateTax,
    ): Promise<boolean> => {
      return this.concurrencyLimit(async () => {
        const taxIdentifier = norisItem.ICO_RC
        const taxExists = taxIdentifierToTax.get(taxIdentifier)
        if (!taxExists) {
          return false
        }
        try {
          await this.updateExistingTaxRecord(
            taxDefinition,
            norisItem,
            taxExists.id,
            year,
            userDataFromCityAccount,
          )
          return true
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
          return false
        }
      })
    }

    const results = await Promise.all(
      norisData.map((norisItem) => updateTaxRecord(norisItem)),
    )
    const count = results.filter(Boolean).length

    return { updated: count }
  }
}
