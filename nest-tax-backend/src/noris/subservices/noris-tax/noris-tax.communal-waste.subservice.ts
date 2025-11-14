import { Injectable } from '@nestjs/common'
import groupBy from 'lodash/groupBy'
import * as mssql from 'mssql'

import { RequestPostNorisLoadDataDto } from '../../../admin/dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from '../../../admin/dtos/responses.dto'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
import {
  NorisBaseTaxSchema,
  NorisRawCommunalWasteTaxSchema,
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
export class NorisTaxCommunalWasteSubservice extends AbstractNorisTaxSubservice {
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

  getAndProcessNorisTaxDataByBirthNumberAndYear(): Promise<CreateBirthNumbersResponseDto> {
    throw new Error('Not implemented')
  }

  processNorisTaxData(): Promise<string[]> {
    throw new Error('Not implemented')
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
    data: RequestPostNorisLoadDataDto,
  ): Promise<NorisCommunalWasteTax[]> {
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
    records: NorisCommunalWasteTax[],
  ): NorisCommunalWasteTaxGrouped[] {
    const grouped = groupBy(records, 'variabilny_symbol')

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
        NorisBaseTaxSchema.shape,
      ) as (keyof NorisBaseTax)[]

      const baseData = Object.fromEntries(
        baseKeys.map((key) => [key, base[key]]),
      ) as NorisBaseTax

      const groupedData: NorisCommunalWasteTaxGrouped = {
        ...baseData,
        containers,
      }

      result.push(groupedData)
    })

    return result
  }
}
