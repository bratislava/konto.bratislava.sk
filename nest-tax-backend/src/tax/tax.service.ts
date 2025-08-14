import path from 'node:path'

import { Injectable } from '@nestjs/common'
import { PaymentStatus, Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import ejs from 'ejs'
import { PrismaService } from 'src/prisma/prisma.service'
import ThrowerErrorGuard from 'src/utils/guards/errors.guard'
import { computeIsPayableYear } from 'src/utils/helpers/payment.helper'
import { QrCodeSubservice } from 'src/utils/subservices/qrcode.subservice'

import { PaymentGateURLGeneratorDto } from '../payment/dtos/generator.dto'
import {
  CustomErrorPdfCreateTypesEnum,
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from './dtos/error.dto'
import {
  ResponseGetTaxesBodyDto,
  ResponseGetTaxesDto,
  ResponseInstallmentPaymentDetailDto,
  ResponseOneTimePaymentDetailsDto,
  ResponseTaxDto,
  ResponseTaxPayerReducedDto,
  ResponseTaxSummaryDetailDto,
} from './dtos/response.tax.dto'
import { taxDetailsToPdf, taxTotalsToPdf } from './utils/helpers/pdf.helper'
import { fixInstallmentTexts, getTaxStatus } from './utils/helpers/tax.helper'
import {
  getTaxDetailPure,
  getTaxDetailPureForInstallmentGenerator,
  getTaxDetailPureForOneTimeGenerator,
} from './utils/unified-tax.util'

const paymentCalendarThreshold = 6600

const specificSymbol = '2025200000'

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

  async getTaxByYear(
    year: number,
    birthNumber: string,
  ): Promise<ResponseTaxDto> {
    if (!birthNumber || !year) {
      throw this.throwerErrorGuard.NotFoundException(
        CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
      )
    }

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

    const paidAmount = await this.getAmountAlreadyPaidByTaxId(tax.id)

    if (paidAmount > 0 && tax.amount - paidAmount > 0) {
      tax.qrCodeWeb = await this.qrCodeSubservice.createQrCode({
        amount: tax.amount - paidAmount,
        variableSymbol: tax.variableSymbol,
        specificSymbol: '2023200000',
      })
    }

    // hardcoded dates 'text' of installments because they were generated incorrectly in NORIS
    const taxInstallments = fixInstallmentTexts(
      tax.taxInstallments,
      tax.year,
    ).map((installment) => ({
      ...installment,
      order: installment.order.toString(),
    }))

    const paidStatus = getTaxStatus(tax.amount, paidAmount)

    // TODO: We stopped generating PDFs in 2024, edit this for advanced logic
    // const pdfExport = year <= 2023
    // Temporarily disabled
    const pdfExport = false

    const isPayable = computeIsPayableYear(tax.year)

    return {
      ...tax,
      taxInstallments,
      paidAmount,
      paidStatus,
      pdfExport,
      isPayable,
      taxAdministrator: tax.taxPayer.taxAdministrator,
    }
  }

  async loadTaxes(birthNumber: string): Promise<ResponseGetTaxesDto> {
    if (!birthNumber) {
      throw this.throwerErrorGuard.ForbiddenException(
        CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.BIRTHNUMBER_NOT_EXISTS,
      )
    }
    const taxPayments = await this.prisma.taxPayment.groupBy({
      by: ['taxId'],
      where: {
        tax: {
          taxPayer: {
            birthNumber,
          },
        },
        status: PaymentStatus.SUCCESS,
      },
      _sum: {
        amount: true,
      },
      orderBy: { taxId: 'desc' },
    })

    const taxes = await this.prisma.tax.findMany({
      where: {
        taxPayer: {
          birthNumber,
        },
      },
      orderBy: {
        taxId: 'desc',
      },
      select: {
        id: true,
        uuid: true,
        createdAt: true,
        amount: true,
        year: true,
      },
    })

    const taxPayer = await this.prisma.taxPayer.findUnique({
      where: {
        birthNumber,
      },
      include: {
        taxAdministrator: true,
      },
    })

    const items: ResponseGetTaxesBodyDto[] = taxes.map((tax) => {
      const taxPaymentItem = taxPayments.find(
        (taxPayment) => taxPayment.taxId === tax.id,
      )

      const paidAmount = taxPaymentItem?._sum.amount ?? 0
      const paidStatus = getTaxStatus(tax.amount, paidAmount || undefined)

      const isPayable = computeIsPayableYear(tax.year)

      return {
        ...tax,
        paidAmount,
        paidStatus,
        isPayable,
      }
    })

    return {
      isInNoris: items.length > 0,
      items,
      taxAdministrator: taxPayer ? taxPayer.taxAdministrator : null,
    }
  }

  async generatePdf(year: number, birthNumber: string): Promise<string> {
    try {
      const user = await this.getTaxByYear(year, birthNumber)
      const taxDetails = taxDetailsToPdf(user.taxDetails)
      const totals = taxTotalsToPdf(
        user,
        user.taxInstallments.map((data) => ({
          ...data,
          order: data.order ? +data.order : 1,
        })),
      )
      return await ejs.renderFile('public/tax-pdf.ejs', {
        user,
        logo: path.resolve('public/logoBaTax.png'),
        taxDetails,
        totals,
      })
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPdfCreateTypesEnum.PDF_CREATE_ERROR,
        'Error to create pdf',
        'Error to create pdf',
        undefined,
        error,
      )
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
    const paidStatus = getTaxStatus(
      detailWithoutQrCode.overallAmount,
      detailWithoutQrCode.overallPaid,
    )
    const taxPayer: ResponseTaxPayerReducedDto = {
      name: tax.taxPayer.name,
      permanentResidenceStreet: tax.taxPayer.permanentResidenceStreet,
      permanentResidenceZip: tax.taxPayer.permanentResidenceZip,
      permanentResidenceCity: tax.taxPayer.permanentResidenceCity,
      externalId: tax.taxPayer.externalId,
    }

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
