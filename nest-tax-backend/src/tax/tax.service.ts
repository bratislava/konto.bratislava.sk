import { Injectable } from '@nestjs/common'
import { PaymentStatus, Prisma, TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { PaymentGateURLGeneratorDto } from '../payment/dtos/generator.dto'
import { PrismaService } from '../prisma/prisma.service'
import { getTaxDefinitionByType } from '../tax-definitions/getTaxDefinitionByType'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from './dtos/error.dto'
import {
  ResponseCommunalWasteTaxSummaryDetailDto,
  ResponseGetTaxesListBodyDto,
  ResponseGetTaxesListDto,
  ResponseRealEstateTaxSummaryDetailDto,
  TaxAvailabilityStatus,
  TaxStatusEnum,
} from './dtos/response.tax.dto'
import { TaxRealEstateSubservice } from './subservices/tax/tax.real-estate.subservice'
import {
  AbstractTaxSubservice,
  specificSymbol,
} from './subservices/tax/tax.subservice.abstract'
import {
  checkTaxDateInclusion,
  getExistingTaxStatus,
} from './utils/helpers/tax.helper'
import {
  getTaxDetailPureForInstallmentGenerator,
  getTaxDetailPureForOneTimeGenerator,
} from './utils/unified-tax.util'

dayjs.extend(utc)
dayjs.extend(timezone)

const lookingForTaxDate = {
  from: { month: 2, day: 1 },
  to: { month: 7, day: 1 },
}

@Injectable()
export class TaxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly qrCodeSubservice: QrCodeSubservice,
    private readonly taxRealEstateSubservice: TaxRealEstateSubservice,
  ) {}

  private getImplementationByType(taxType: TaxType): AbstractTaxSubservice {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (taxType) {
      case TaxType.DZN:
        return this.taxRealEstateSubservice

      default:
        throw this.throwerErrorGuard.InternalServerErrorException(
          CustomErrorTaxTypesEnum.TAX_TYPE_NOT_FOUND,
          `Implementation for tax type ${taxType} not found`,
        )
    }
  }

  private async getAmountAlreadyPaidByTaxId(id: number) {
    const taxPayment = await this.prisma.taxPayment.aggregate({
      where: {
        taxId: id,
        status: PaymentStatus.SUCCESS,
      },
      _sum: {
        amount: true,
      },
    })

    return taxPayment._sum.amount || 0
  }

  async getListOfTaxesByBirthnumberAndType(
    birthNumber: string,
    type: TaxType,
  ): Promise<ResponseGetTaxesListDto> {
    if (!birthNumber) {
      throw this.throwerErrorGuard.ForbiddenException(
        CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.BIRTHNUMBER_NOT_EXISTS,
      )
    }

    const taxPayer = await this.prisma.taxPayer.findUnique({
      where: {
        birthNumber,
      },
      include: {
        taxAdministrator: true,
      },
    })
    const taxAdministrator = taxPayer ? taxPayer.taxAdministrator : null

    const taxes = await this.prisma.tax.findMany({
      where: {
        taxPayer: {
          birthNumber,
        },
        type,
      },
      orderBy: [{ year: 'desc' }, { order: 'desc' }],
      select: {
        id: true,
        createdAt: true,
        amount: true,
        year: true,
        type: true,
        order: true,
      },
    })
    const currentTime = dayjs().tz('Europe/Bratislava')

    const shouldAddCurrentYear = checkTaxDateInclusion(
      currentTime,
      lookingForTaxDate,
    )

    // TaxPayer is updated only if tax was searched for in Noris
    const taxPayerWasUpdated = taxPayer
      ? taxPayer.updatedAt.getTime() - taxPayer.createdAt.getTime() > 1000 // 1 second threshold
      : false

    if (taxes.length === 0) {
      const availabilityStatus =
        shouldAddCurrentYear || !taxPayerWasUpdated
          ? TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX
          : TaxAvailabilityStatus.TAX_NOT_ON_RECORD
      return {
        availabilityStatus,
        items: [],
        taxAdministrator,
      }
    }

    const items: ResponseGetTaxesListBodyDto[] = await Promise.all(
      taxes.map(async (tax) => {
        const paid = await this.getAmountAlreadyPaidByTaxId(tax.id)
        const amountToBePaid = tax.amount - paid
        const status = getExistingTaxStatus(tax.amount, paid)
        return {
          createdAt: tax.createdAt,
          year: tax.year,
          amountToBePaid,
          status,
          type: tax.type,
          order: tax.order!, // non-null by DB trigger and constraint
        }
      }),
    )

    const currentYearTaxExists = items.some(
      (item) => item.year === currentTime.year(),
    )

    if (
      !currentYearTaxExists &&
      (shouldAddCurrentYear || !taxPayerWasUpdated)
    ) {
      items.unshift({
        year: currentTime.year(),
        status: TaxStatusEnum.AWAITING_PROCESSING,
        type,
        order: 1,
      })
    }

    return {
      availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
      items,
      taxAdministrator,
    }
  }

  async getTaxDetail(
    birthNumber: string,
    year: number,
    type: TaxType,
    order: number,
  ): Promise<ResponseRealEstateTaxSummaryDetailDto | ResponseCommunalWasteTaxSummaryDetailDto> {
    return this.getImplementationByType(type).getTaxDetail(
      birthNumber,
      year,
      order,
    )
  }

  async getOneTimePaymentGenerator(
    taxPayerWhereUniqueInput: Prisma.TaxPayerWhereUniqueInput,
    year: number,
    type: TaxType,
    order: number,
  ): Promise<PaymentGateURLGeneratorDto> {
    const tax = await this.getImplementationByType(type).fetchTaxData(
      taxPayerWhereUniqueInput,
      { taxPayments: true },
      year,
      type,
      order,
    )

    return getTaxDetailPureForOneTimeGenerator({
      taxId: tax.id,
      overallAmount: tax.amount,
      taxPayments: tax.taxPayments,
    })
  }

  async getInstallmentPaymentGenerator(
    taxPayerWhereUniqueInput: Prisma.TaxPayerWhereUniqueInput,
    year: number,
    type: TaxType,
    order: number,
  ): Promise<PaymentGateURLGeneratorDto> {
    const today = dayjs().tz('Europe/Bratislava').toDate()

    const tax = await this.getImplementationByType(type).fetchTaxData(
      taxPayerWhereUniqueInput,
      { taxInstallments: true, taxPayments: true },
      year,
      type,
      order,
    )

    const taxDefinition = getTaxDefinitionByType(type)

    return getTaxDetailPureForInstallmentGenerator({
      taxId: tax.id,
      taxDefinition,
      taxYear: year,
      today,
      overallAmount: tax.amount,
      variableSymbol: tax.variableSymbol,
      dateOfValidity: tax.dateTaxRuling,
      installments: tax.taxInstallments,
      specificSymbol,
      taxPayments: tax.taxPayments,
    })
  }
}
