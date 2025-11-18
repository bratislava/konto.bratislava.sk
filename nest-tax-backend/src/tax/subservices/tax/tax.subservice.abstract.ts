import { Prisma, TaxType } from '@prisma/client'

import { PrismaService } from '../../../prisma/prisma.service'
import { TaxDefinition } from '../../../tax-definitions/taxDefinitionsTypes'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../../dtos/error.dto'
import {
  ResponseCommunalWasteTaxSummaryDetailDto,
  ResponseRealEstateTaxSummaryDetailDto,
} from '../../dtos/response.tax.dto'

export const specificSymbol = '2025200000'

export abstract class AbstractTaxSubservice<
  TTaxType extends TaxType = TaxType,
> {
  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly throwerErrorGuard: ThrowerErrorGuard,
    protected readonly taxDefinition: TaxDefinition<TTaxType>,
  ) {}

  /**
   * Gets the tax detail, with installments and payment info from database, for a given birth number, year and order.
   *
   * @param birthNumber - Birth number of the tax payer
   * @param year - Year of the tax
   * @param order - Order of the tax
   * @returns Tax detail
   */
  abstract getTaxDetail(
    birthNumber: string,
    year: number,
    order: number,
  ): Promise<
    | ResponseRealEstateTaxSummaryDetailDto
    | ResponseCommunalWasteTaxSummaryDetailDto
  >

  /**
   * Fetches the tax data from database for a given tax payer, year, type and order.
   *
   * @param taxPayerWhereUniqueInput - Tax payer where unique input
   * @param include - Include fields
   * @param year - Year of the tax
   * @param type - Type of the tax
   * @param order - Order of the tax
   * @returns Tax data from database
   */
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
