import path from 'node:path'

import { HttpException, Injectable } from '@nestjs/common'
import { PaymentStatus } from '@prisma/client'
import ejs from 'ejs'
import { PrismaService } from 'src/prisma/prisma.service'
import { ErrorThrowerGuard } from 'src/utils/guards/errors.guard'
import { computeIsPayableYear } from 'src/utils/helpers/payment.helper'
import { QrCodeSubservice } from 'src/utils/subservices/qrcode.subservice'

import {
  ResponseGetTaxesBodyDto,
  ResponseGetTaxesDto,
  ResponseTaxDto,
} from './dtos/requests.tax.dto'
import { taxDetailsToPdf, taxTotalsToPdf } from './utils/helpers/pdf.helper'
import { getTaxStatus } from './utils/helpers/tax.helper'

@Injectable()
export class TaxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorThrowerGuard: ErrorThrowerGuard,
    private readonly qrCodeSubservice: QrCodeSubservice,
  ) {}

  async getTaxByYear(
    year: number,
    birthNumber: string,
  ): Promise<ResponseTaxDto> {
    if (!birthNumber || !year) {
      throw this.errorThrowerGuard.taxNotFound()
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
      throw this.errorThrowerGuard.taxNotFound()
    }

    const taxPayment = await this.prisma.taxPayment.groupBy({
      by: ['taxId'],
      where: {
        taxId: tax.id,
        status: PaymentStatus.SUCCESS,
      },
      _sum: {
        amount: true,
      },
    })

    let total = 0
    if (taxPayment.length === 1) {
      total = taxPayment[0]._sum.amount || 0
    }

    if (total > 0 && tax.amount - total > 0) {
      const qrCode = await this.qrCodeSubservice.createQrCode({
        amount: tax.amount - total,
        variableSymbol: tax.variableSymbol,
        specificSymbol: '2023200000',
      })
      tax.qrCodeWeb = qrCode
    }

    // hardcoded dates 'text' of installments because they were generated incorrectly in NORIS
    const taxInstallments = tax.taxInstallments.map((taxInstallment, i) => {
      if (i === 1) {
        return {
          ...taxInstallment,
          text: `- druhá splátka v termíne do 31.08.${tax.year} v sume:`,
        }
      }
      if (i === 2) {
        return {
          ...taxInstallment,
          text: `- tretia splátka v termíne do 31.10.${tax.year} v sume:`,
        }
      }
      return taxInstallment
    })

    const paidStatus = getTaxStatus(tax.amount, total)

    // TODO: We stopped generating PDFs in 2024, edit this for advanced logic
    // const pdfExport = year <= 2023
    // Temporarily disabled
    const pdfExport = false

    const isPayable = computeIsPayableYear(tax.year)

    return {
      ...tax,
      taxInstallments,
      payedAmount: total,
      paidStatus,
      pdfExport,
      isPayable,
    }
  }

  async loadTaxes(birthNumber: string): Promise<ResponseGetTaxesDto> {
    if (!birthNumber) {
      throw new HttpException({ message: 'Birthnumber not exists' }, 403)
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
      throw this.errorThrowerGuard.renderPdfError(error)
    }
  }
}
