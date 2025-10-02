import { Prisma, TaxType } from '@prisma/client'

import { PrismaService } from '../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../../dtos/error.dto'
import { ResponseTaxSummaryDetailDto } from '../../dtos/response.tax.dto'

export const paymentCalendarThreshold = 6600

export const specificSymbol = '2025200000'

export abstract class TaxSubserviceByType {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  abstract getTaxDetail(
    birthNumber: string,
    year: number,
    order: number,
  ): Promise<ResponseTaxSummaryDetailDto>

  async fetchTaxData<T extends Prisma.TaxInclude>(
    taxPayerWhereUniqueInput: Prisma.TaxPayerWhereUniqueInput,
    include: T,
    year: number,
    type: TaxType,
    order: number,
  ) {
    const taxPayer = await this.prisma.taxPayer.findUnique({
      where: taxPayerWhereUniqueInput,
      select: { id: true },
    })

    if (!taxPayer) {
      throw this.throwerErrorGuard.NotFoundException(
        CustomErrorTaxTypesEnum.TAX_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_USER_NOT_FOUND,
      )
    }

    const tax = await this.prisma.tax.findUnique<{
      where: Prisma.TaxWhereUniqueInput
      include: T
    }>({
      where: {
        taxPayerId_year_type_order: {
          year,
          taxPayerId: taxPayer.id,
          type,
          order,
        },
      },
      include,
    })

    if (!tax) {
      throw this.throwerErrorGuard.NotFoundException(
        CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
      )
    }

    return tax
  }
}
