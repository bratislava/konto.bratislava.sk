import { Injectable } from '@nestjs/common'
import { Request } from 'mssql'

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
  BaseNorisCommunalWasteTaxDto,
  NorisCommunalWasteTaxGroupedDto,
  NorisRawCommunalWasteTaxDto,
} from '../../noris.dto'
import { baseNorisCommunalWasteTaxSchema } from '../../noris.schema'
import { getCommunalWasteTaxesFromNoris } from '../../utils/noris.queries'
import { NorisConnectionSubservice } from '../noris-connection.subservice'
import { NorisPaymentSubservice } from '../noris-payment.subservice'
import { NorisTaxByType } from './noris-tax-by-type.abstract'

@Injectable()
export class NorisTaxCommunalWasteSubservice extends NorisTaxByType {
  private readonly logger = new LineLoggerSubservice(
    NorisTaxCommunalWasteSubservice.name,
  )

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly prismaService: PrismaService,
    private readonly bloomreachService: BloomreachService,
    private readonly paymentSubservice: NorisPaymentSubservice,
    qrCodeSubservice: QrCodeSubservice,
  ) {
    super(qrCodeSubservice)
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
  ): Promise<NorisRawCommunalWasteTaxDto[]> {
    const norisData = await this.connectionService.withConnection(
      async (connection) => {
        const request = new Request(connection)

        const birthNumbersPlaceholders = data.birthNumbers
          .map((_, index) => `@birth_number${index}`)
          .join(',')
        data.birthNumbers.forEach((birthNumber, index) => {
          request.input(`birth_number${index}`, birthNumber)
        })
        request.input('year', data.year)

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
    return norisData.recordset
  }

  processWasteTaxRecords(
    records: NorisRawCommunalWasteTaxDto[],
  ): NorisCommunalWasteTaxGroupedDto[] {
    const grouped: Record<string, NorisRawCommunalWasteTaxDto[]> = {}

    records.forEach((rec) => {
      if (!grouped[rec.variabilny_symbol]) {
        grouped[rec.variabilny_symbol] = []
      }
      grouped[rec.variabilny_symbol].push(rec)
    })

    const result: NorisCommunalWasteTaxGroupedDto[] = []

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
        baseNorisCommunalWasteTaxSchema.shape,
      ) as (keyof BaseNorisCommunalWasteTaxDto)[]

      const baseData = Object.fromEntries(
        baseKeys.map((key) => [key, base[key]]),
      ) as BaseNorisCommunalWasteTaxDto

      const groupedData: NorisCommunalWasteTaxGroupedDto = {
        ...baseData,
        containers,
      }

      result.push(groupedData)
    })

    return result
  }
}
