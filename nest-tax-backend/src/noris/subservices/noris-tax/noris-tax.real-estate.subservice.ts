import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import * as mssql from 'mssql'

import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
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
  ) {
    const logger = new LineLoggerSubservice(NorisTaxRealEstateSubservice.name)
    super(
      qrCodeSubservice,
      prismaService,
      bloomreachService,
      throwerErrorGuard,
      logger,
      cityAccountSubservice,
      paymentSubservice,
    )
  }

  protected getTaxType(): typeof TaxType.DZN {
    return TaxType.DZN
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
}
