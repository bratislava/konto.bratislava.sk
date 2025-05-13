import path from 'node:path'

import { Injectable } from '@nestjs/common'
import { PaymentStatus } from '@prisma/client'
import ejs from 'ejs'
import { PrismaService } from 'src/prisma/prisma.service'
import ThrowerErrorGuard from 'src/utils/guards/errors.guard'
import { computeIsPayableYear } from 'src/utils/helpers/payment.helper'
import { QrCodeSubservice } from 'src/utils/subservices/qrcode.subservice'

import {
  CustomErrorPdfCreateTypesEnum,
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from './dtos/error.dto'
import {
  InstallmentPaymentDetail,
  OneTimePaymentDetails,
  OneTimePaymentTypeEnum,
  ResponseGetTaxesBodyDto,
  ResponseGetTaxesDto,
  ResponseTaxDto,
  TaxSummaryDetail,
} from './dtos/response.tax.dto'
import { taxDetailsToPdf, taxTotalsToPdf } from './utils/helpers/pdf.helper'
import { fixInstallmentTexts, getTaxStatus } from './utils/helpers/tax.helper'
import dayjs from 'dayjs'
import { getTaxDetailPure } from './utils/unified-tax.util'
import { PaymentService } from '../payment/payment.service'

@Injectable()
export class TaxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly qrCodeSubservice: QrCodeSubservice,
    private paymentService: PaymentService,
  ) {}

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
    const tax = await this.prisma.tax.findFirst({
      where: {
        year: +year,
        taxPayer: {
          birthNumber,
        },
      },
      include: {
        taxInstallments: true,
        taxPayer: true,
        taxDetails: true,
        taxEmployees: true,
      },
    })

    if (!tax) {
      throw this.throwerErrorGuard.NotFoundException(
        CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
      )
    }

    const paidAmount = await this.getAmountAlreadyPaidByTaxId(tax.id)

    if (paidAmount > 0 && tax.amount - paidAmount > 0) {
      const qrCode = await this.qrCodeSubservice.createQrCode({
        amount: tax.amount - paidAmount,
        variableSymbol: tax.variableSymbol,
        specificSymbol: '2023200000',
      })
      tax.qrCodeWeb = qrCode
    }

    // hardcoded dates 'text' of installments because they were generated incorrectly in NORIS
    const taxInstallments = fixInstallmentTexts(tax.taxInstallments, tax.year)

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
    }
  }

  async generatePdf(year: number, birthNumber: string): Promise<string> {
    try {
      const user = await this.getTaxByYear(year, birthNumber)
      const taxDetails = taxDetailsToPdf(user.taxDetails)
      const totals = taxTotalsToPdf(user, user.taxInstallments)
      const ejsData = await ejs.renderFile('public/tax-pdf.ejs', {
        user,
        logo: path.resolve('public/logoBaTax.png'),
        taxDetails,
        totals,
      })
      return ejsData
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPdfCreateTypesEnum.PDF_CREATE_ERROR,
        'Error to create pdf',
        'Error to create pdf',
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async getTaxDetail(
    birthNumber: string,
    year: number,
  ): Promise<TaxSummaryDetail> {
    const today = dayjs().tz('Europe/Bratislava')

    const tax = await this.prisma.tax.findFirst({
      where: {
        year: +year,
        taxPayer: {
          birthNumber,
        },
      },
      include: {
        taxInstallments: true,
        taxPayer: true,
        taxDetails: true,
        taxEmployees: true,
      },
    })

    if (!tax) {
      throw this.throwerErrorGuard.NotFoundException(
        CustomErrorTaxTypesEnum.TAX_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_USER_NOT_FOUND,
      )
    }

    const overallPaidTax = await this.getAmountAlreadyPaidByTaxId(tax.id)

    const detailWithoutQrCode = getTaxDetailPure(
      overallPaidTax,
      +year,
      today.toDate(),
      tax.amount,
      '11-1',
      tax.variableSymbol,
      tax.dateTaxRuling,
      tax.taxInstallments,
    )

    let paymentGatewayLink: string | undefined = undefined
    if (
      detailWithoutQrCode.oneTimePayment.isPossible &&
      detailWithoutQrCode.oneTimePayment.type ==
        OneTimePaymentTypeEnum.ONE_TIME_PAYMENT
    ) {
      paymentGatewayLink = await this.paymentService.getPayGateUrlByUserAndYear(
        year.toString(),
        birthNumber,
      )
    }

    let oneTimePaymentQrCode: string | undefined = undefined
    if (detailWithoutQrCode.oneTimePayment.qrCodeArgs) {
      oneTimePaymentQrCode = await this.qrCodeSubservice.createQrCode(
        detailWithoutQrCode.oneTimePayment.qrCodeArgs,
      )
      delete detailWithoutQrCode.oneTimePayment.qrCodeArgs
    }
    const oneTimePayment: OneTimePaymentDetails = {
      ...detailWithoutQrCode.oneTimePayment,
      qrCode: oneTimePaymentQrCode,
      paymentGatewayLink,
    }

    let installmentsQrCodes: string[] | undefined = undefined
    if (detailWithoutQrCode.installmentPayment.installments) {
      installmentsQrCodes = await Promise.all(
        detailWithoutQrCode.installmentPayment.installments.map(
          async (installment) => {
            return await this.qrCodeSubservice.createQrCode(
              installment.qrCodeArgs, // TODO qrCodeArgs can be undefined
            )
          },
        ),
      )
      // TODO delete this?
      delete detailWithoutQrCode.installmentPayment.installments[0].qrCodeArgs
      delete detailWithoutQrCode.installmentPayment.installments[1].qrCodeArgs
      delete detailWithoutQrCode.installmentPayment.installments[2].qrCodeArgs
    }

    const installmentPayment: InstallmentPaymentDetail = {
      ...detailWithoutQrCode.installmentPayment,
      installments: detailWithoutQrCode.installmentPayment.installments
        ? [
            {
              ...detailWithoutQrCode.installmentPayment.installments[0],
              qrCode: installmentsQrCodes?.[0],
            },
            {
              ...detailWithoutQrCode.installmentPayment.installments[1],
              qrCode: installmentsQrCodes?.[1],
            },
            {
              ...detailWithoutQrCode.installmentPayment.installments[2],
              qrCode: installmentsQrCodes?.[2],
            },
          ]
        : undefined,
    }

    return { ...detailWithoutQrCode, oneTimePayment, installmentPayment }
  }
}
