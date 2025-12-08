import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import groupBy from 'lodash/groupBy'
import * as mssql from 'mssql'

import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
import { CustomErrorNorisTypesEnum } from '../../noris.errors'
import {
  NorisBaseTaxSchema,
  NorisCommunalWasteTaxSchema,
} from '../../types/noris.schema'
import {
  NorisBaseTax,
  NorisCommunalWasteTax,
  NorisCommunalWasteTaxGrouped,
} from '../../types/noris.types'
import { getCommunalWasteTaxesFromNoris } from '../../utils/noris.queries'
import { NorisConnectionSubservice } from '../noris-connection.subservice'
import { NorisPaymentSubservice } from '../noris-payment.subservice'
import { NorisValidatorSubservice } from '../noris-validator.subservice'
import { AbstractNorisTaxSubservice } from './noris-tax.subservice.abstract'

@Injectable()
export class NorisTaxCommunalWasteSubservice extends AbstractNorisTaxSubservice<
  typeof TaxType.KO
> {
  constructor(
    private readonly connectionService: NorisConnectionSubservice,
    private readonly norisValidatorSubservice: NorisValidatorSubservice,

    qrCodeSubservice: QrCodeSubservice,
    throwerErrorGuard: ThrowerErrorGuard,
    prismaService: PrismaService,
    bloomreachService: BloomreachService,
    cityAccountSubservice: CityAccountSubservice,
    paymentSubservice: NorisPaymentSubservice,
    databaseSubservice: DatabaseSubservice,
  ) {
    const logger = new LineLoggerSubservice(
      NorisTaxCommunalWasteSubservice.name,
    )
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

  protected getTaxType(): typeof TaxType.KO {
    return TaxType.KO
  }

  protected async getTaxDataByYearAndBirthNumber(
    year: number,
    birthNumbers: string[],
  ): Promise<NorisCommunalWasteTaxGrouped[]> {
    const norisData = await this.getCommunalWasteTaxDataByBirthNumberAndYear(
      year,
      birthNumbers,
    )
    return this.groupCommunalWasteTaxRecords(norisData)
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
    year: number,
    birthNumbers: string[],
  ): Promise<NorisCommunalWasteTax[]> {
    const norisData = await this.connectionService.withConnection(
      async (connection) => {
        const request = new mssql.Request(connection)

        const birthNumbersPlaceholders = birthNumbers
          .map((_, index) => `@birth_number${index}`)
          .join(',')
        birthNumbers.forEach((birthNumber, index) => {
          request.input(`birth_number${index}`, mssql.VarChar(20), birthNumber)
        })
        request.input('year', mssql.Int, year)

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
      NorisCommunalWasteTaxSchema,
      norisData.recordset,
    )
  }

  private groupCommunalWasteTaxRecords(
    records: NorisCommunalWasteTax[],
  ): NorisCommunalWasteTaxGrouped[] {
    const grouped = groupBy(records, 'variabilny_symbol')

    const result: NorisCommunalWasteTaxGrouped[] = []

    Object.values(grouped).forEach((group) => {
      // Take the first record as "base" since all other fields are the same
      const base = group[0]

      // Group by address within this variable symbol group
      const addressGrouped = groupBy(group, (r) => {
        return `${r.ulica || ''}_${r.orientacne_cislo || ''}`
      })

      const addresses = Object.values(addressGrouped).map((addressGroup) => {
        // Take the first record to get the address (all records in this group have the same address)
        const firstRecord = addressGroup[0]

        const containers = addressGroup.map((r) => ({
          objem_nadoby: r.objem_nadoby,
          pocet_nadob: r.pocet_nadob,
          pocet_odvozov: r.pocet_odvozov,
          sadzba: r.sadzba,
          poplatok: r.poplatok,
          druh_nadoby: r.druh_nadoby,
        }))

        return {
          addressDetail: {
            street: firstRecord.ulica,
            orientationNumber: firstRecord.orientacne_cislo,
          },
          containers,
        }
      })

      // Get all keys from BaseNorisCommunalWasteTaxDto
      const baseKeys = Object.keys(
        NorisBaseTaxSchema.shape,
      ) as (keyof NorisBaseTax)[]

      const baseData = Object.fromEntries(
        baseKeys.map((key) => [key, base[key]]),
      ) as NorisBaseTax

      const groupedData: NorisCommunalWasteTaxGrouped = {
        type: TaxType.KO,
        ...baseData,
        addresses,
      }

      result.push(groupedData)
    })

    return result
  }

  async getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    year: number,
    birthNumbers: string[],
  ): Promise<{ updated: number }> {
    let norisData: NorisCommunalWasteTaxGrouped[]
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

    const taxDefinition = this.getTaxDefinition()

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        norisData.map((norisRecord) => norisRecord.ICO_RC),
      )

    // Query existing taxes - use variableSymbol for non-unique taxes (KO is not unique)
    const taxesExist = await this.prismaService.tax.findMany({
      select: {
        id: true,
        variableSymbol: true,
      },
      where: {
        variableSymbol: {
          in: norisData.map((norisRecord) => norisRecord.variabilny_symbol),
        },
        year,
        type: this.getTaxType(),
      },
    })
    const taxIdentifierToTax = new Map(
      taxesExist.map((tax) => [tax.variableSymbol, tax]),
    )

    await Promise.all(
      norisData.map(async (norisItem) =>
        this.concurrencyLimit(async () => {
          const taxIdentifier = norisItem.variabilny_symbol
          const taxExists = taxIdentifierToTax.get(taxIdentifier)
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
                taxDefinition,
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
