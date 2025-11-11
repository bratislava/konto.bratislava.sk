import { Injectable } from '@nestjs/common'
import { PaymentStatus, Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { PaymentGateURLGeneratorDto } from '../payment/dtos/generator.dto'
import { PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from './dtos/error.dto'
import {
  ResponseGetTaxesListBodyDto,
  ResponseGetTaxesListDto,
  ResponseInstallmentPaymentDetailDto,
  ResponseOneTimePaymentDetailsDto,
  ResponseTaxPayerReducedDto,
  ResponseTaxSummaryDetailDto,
  TaxAvailabilityStatus,
  TaxStatusEnum,
} from './dtos/response.tax.dto'
import {
  checkTaxDateInclusion,
  getExistingTaxStatus,
  getTaxStatus,
} from './utils/helpers/tax.helper'
import {
  getTaxDetailPure,
  getTaxDetailPureForInstallmentGenerator,
  getTaxDetailPureForOneTimeGenerator,
} from './utils/unified-tax.util'

dayjs.extend(utc)
dayjs.extend(timezone)

const paymentCalendarThreshold = 6600

const specificSymbol = '2025200000'

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
  ) {}

  async fetchTaxData<T extends Prisma.TaxInclude>(
    taxPayerWhereUniqueInput: Prisma.TaxPayerWhereUniqueInput,
    include: T,
    year: number,
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
        taxPayerId_year: {
          year,
          taxPayerId: taxPayer.id,
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

  async getListOfTaxesByBirthnumber(
    birthNumber: string,
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
      },
      orderBy: {
        year: 'desc',
      },
      select: {
        id: true,
        createdAt: true,
        amount: true,
        year: true,
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
  ): Promise<ResponseTaxSummaryDetailDto> {
    const today = dayjs().tz('Europe/Bratislava')

    const tax = await this.fetchTaxData(
      { birthNumber },
      {
        taxInstallments: true,
        taxPayer: {
          include: {
            taxAdministrator: true,
          },
        },
        taxDetails: true,
        taxPayments: true,
      },
      year,
    )

    const detailWithoutQrCode = getTaxDetailPure({
      taxYear: +year,
      today: today.toDate(),
      overallAmount: tax.amount,
      paymentCalendarThreshold,
      variableSymbol: tax.variableSymbol,
      dateOfValidity: tax.dateTaxRuling,
      installments: tax.taxInstallments,
      taxDetails: tax.taxDetails,
      taxConstructions: tax.taxConstructions ?? 0,
      taxFlat: tax.taxFlat ?? 0,
      taxLand: tax.taxLand ?? 0,
      specificSymbol,
      taxPayments: tax.taxPayments,
    })

    let oneTimePaymentQrCode: string | undefined
    if (detailWithoutQrCode.oneTimePayment.qrCode) {
      oneTimePaymentQrCode = await this.qrCodeSubservice.createQrCode(
        detailWithoutQrCode.oneTimePayment.qrCode,
      )
    }
    const oneTimePayment: ResponseOneTimePaymentDetailsDto = {
      ...detailWithoutQrCode.oneTimePayment,
      qrCode: oneTimePaymentQrCode,
    }

    const installmentPayment: ResponseInstallmentPaymentDetailDto = {
      ...detailWithoutQrCode.installmentPayment,
      activeInstallment: detailWithoutQrCode.installmentPayment
        .activeInstallment
        ? {
            remainingAmount:
              detailWithoutQrCode.installmentPayment.activeInstallment
                .remainingAmount,
            variableSymbol:
              detailWithoutQrCode.installmentPayment.activeInstallment
                .variableSymbol,
            qrCode: await this.qrCodeSubservice.createQrCode(
              detailWithoutQrCode.installmentPayment.activeInstallment.qrCode,
            ),
          }
        : undefined,
    }

    const { taxAdministrator } = tax.taxPayer
    const taxPayer: ResponseTaxPayerReducedDto = {
      name: tax.taxPayer.name,
      permanentResidenceStreet: tax.taxPayer.permanentResidenceStreet,
      permanentResidenceZip: tax.taxPayer.permanentResidenceZip,
      permanentResidenceCity: tax.taxPayer.permanentResidenceCity,
      externalId: tax.taxPayer.externalId,
    }
    const paidStatus = getTaxStatus(
      detailWithoutQrCode.overallAmount,
      detailWithoutQrCode.overallPaid,
    )

    return {
      ...detailWithoutQrCode,
      year,
      paidStatus,
      oneTimePayment,
      installmentPayment,
      taxAdministrator,
      taxPayer,
    }
  }

  async getOneTimePaymentGenerator(
    taxPayerWhereUniqueInput: Prisma.TaxPayerWhereUniqueInput,
    year: number,
  ): Promise<PaymentGateURLGeneratorDto> {
    const tax = await this.fetchTaxData(
      taxPayerWhereUniqueInput,
      { taxPayments: true },
      year,
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
  ): Promise<PaymentGateURLGeneratorDto> {
    const today = dayjs().tz('Europe/Bratislava').toDate()

    const tax = await this.fetchTaxData(
      taxPayerWhereUniqueInput,
      { taxInstallments: true, taxPayments: true },
      year,
    )

    return getTaxDetailPureForInstallmentGenerator({
      taxId: tax.id,
      taxYear: year,
      today,
      overallAmount: tax.amount,
      paymentCalendarThreshold,
      variableSymbol: tax.variableSymbol,
      dateOfValidity: tax.dateTaxRuling,
      installments: tax.taxInstallments,
      specificSymbol,
      taxPayments: tax.taxPayments,
    })
  }
}
