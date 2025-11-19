import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { PrismaService } from '../../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
import { ResponseRealEstateTaxSummaryDetailDto } from '../../dtos/response.tax.dto'
import { AbstractTaxSubservice } from './tax.subservice.abstract'

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export class TaxCommunalWasteSubservice extends AbstractTaxSubservice<
  typeof TaxType.KO
> {
  constructor(
    throwerErrorGuard: ThrowerErrorGuard,
    prismaService: PrismaService,
    private readonly qrCodeSubservice: QrCodeSubservice,
  ) {
    const taxDefinition = getTaxDefinitionByType(TaxType.KO)
    super(prismaService, throwerErrorGuard, taxDefinition)
  }

  async getTaxDetail() // birthNumber: string,
  // year: number,
  // order: number,
  : Promise<ResponseRealEstateTaxSummaryDetailDto> {
    throw new Error('Not implemented!')
  }
}
