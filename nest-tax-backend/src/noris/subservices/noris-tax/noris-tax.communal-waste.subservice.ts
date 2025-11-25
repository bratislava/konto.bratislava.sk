import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import groupBy from 'lodash/groupBy'
import * as mssql from 'mssql'

import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
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
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly paymentSubservice: NorisPaymentSubservice,
    private readonly norisValidatorSubservice: NorisValidatorSubservice,

    qrCodeSubservice: QrCodeSubservice,
    throwerErrorGuard: ThrowerErrorGuard,
    prismaService: PrismaService,
    bloomreachService: BloomreachService,
  ) {
    const logger = new LineLoggerSubservice(
      NorisTaxCommunalWasteSubservice.name,
    )
    super(
      qrCodeSubservice,
      prismaService,
      bloomreachService,
      throwerErrorGuard,
      logger,
    )
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

  async processNorisTaxData(
    norisData: NorisCommunalWasteTaxGrouped[],
    year: number,
  ): Promise<string[]> {
    const birthNumbersResult: Set<string> = new Set()

    this.logger.log(`Data loaded from noris - count ${norisData.length}`)

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        norisData.map((norisRecord) => norisRecord.ICO_RC),
      )

    const taxDefinitionCommunalWaste = getTaxDefinitionByType(TaxType.KO)

    const taxesExist = await this.prismaService.tax.findMany({
      select: {
        variableSymbol: true,
      },
      where: {
        year: +year,
        taxPayer: {
          birthNumber: {
            in: norisData.map((norisRecord) => norisRecord.ICO_RC),
          },
        },
        type: TaxType.KO,
      },
    })
    const existingTaxes = new Set(taxesExist.map((tax) => tax.variableSymbol))

    const norisDataNotInDatabase = norisData.filter(
      (norisItem) => !existingTaxes.has(norisItem.variabilny_symbol),
    )

    await Promise.all(
      norisDataNotInDatabase.map(async (norisItem) =>
        this.concurrencyLimit(async () => {
          await this.processTaxRecordFromNoris(
            taxDefinitionCommunalWaste,
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

  getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(): Promise<{
    updated: number
  }> {
    throw new Error('Not implemented')
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

      const containers = Object.values(addressGrouped).map((addressGroup) => {
        // Take the first record to get the address (all records in this group have the same address)
        const firstRecord = addressGroup[0]

        const details = addressGroup.map((r) => ({
          objem_nadoby: r.objem_nadoby,
          pocet_nadob: r.pocet_nadob,
          pocet_odvozov: r.pocet_odvozov,
          sadzba: r.sadzba,
          poplatok: r.poplatok,
          druh_nadoby: r.druh_nadoby,
        }))

        return {
          address: {
            street: firstRecord.ulica,
            orientationNumber: firstRecord.orientacne_cislo,
          },
          details,
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
        containers,
      }

      result.push(groupedData)
    })

    return result
  }
}
