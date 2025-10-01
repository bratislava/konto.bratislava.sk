import path from 'node:path'

import { Injectable } from '@nestjs/common'
import { PaymentStatus, Prisma, TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import ejs from 'ejs'

import { PaymentGateURLGeneratorDto } from '../payment/dtos/generator.dto'
import { computeIsPayableYear } from '../payment/utils/payment.helper'
import { PrismaService } from '../prisma/prisma.service'
import { getTaxDefinitionByType } from '../tax-definitions/getTaxDefinitionByType'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'
import {
  CustomErrorPdfCreateTypesEnum,
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from './dtos/error.dto'
import {
  ResponseGetTaxesBodyDto,
  ResponseGetTaxesDto,
  ResponseGetTaxesListBodyDto,
  ResponseGetTaxesListDto,
  ResponseTaxDto,
  ResponseTaxSummaryDetailDto,
  TaxAvailabilityStatus,
  TaxStatusEnum,
} from './dtos/response.tax.dto'
import {
  checkTaxDateInclusion,
  fixInstallmentTexts,
  getExistingTaxStatus,
  getTaxStatus,
} from './utils/helpers/tax.helper'
import { TaxRealEstateSubservice } from './utils/tax/tax.real-estate.subservice'
import {
  paymentCalendarThreshold,
  specificSymbol,
  TaxSubserviceByType,
} from './utils/tax/tax-by-type.interface'
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

  private getImplementationByType(taxType: TaxType): TaxSubserviceByType {
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

  async getTaxByYearAndType(
    year: number,
    birthNumber: string,
    type: TaxType,
    order: number,
  ): Promise<ResponseTaxDto> {
    if (!birthNumber || !year) {
      throw this.throwerErrorGuard.NotFoundException(
        CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
      )
    }

    const tax = await this.getImplementationByType(type).fetchTaxData(
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
      type,
      order,
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
      taxPayer: {
        ...tax.taxPayer,
        active: true,
      },
      order,
      taxInstallments,
      paidAmount,
      paidStatus,
      pdfExport,
      isPayable,
      taxAdministrator: tax.taxPayer.taxAdministrator,
    }
  }

  async loadTaxes(
    birthNumber: string,
    type: TaxType,
  ): Promise<ResponseGetTaxesDto> {
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
          type,
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
        type,
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
        type: true,
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
      orderBy: {
        year: 'desc',
      },
      select: {
        id: true,
        createdAt: true,
        amount: true,
        year: true,
        type: true,
      },
    })
    const currentTime = dayjs().tz('Europe/Bratislava')

    const shouldAddCurrentYear = checkTaxDateInclusion(
      currentTime,
      lookingForTaxDate,
    )

    if (taxes.length === 0) {
      const availabilityStatus = shouldAddCurrentYear
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
        }
      }),
    )

    const currentYearTaxExists = items.some(
      (item) => item.year === currentTime.year(),
    )

    if (!currentYearTaxExists && shouldAddCurrentYear) {
      items.unshift({
        year: currentTime.year(),
        status: TaxStatusEnum.AWAITING_PROCESSING,
        type,
      })
    }

    return {
      availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
      items,
      taxAdministrator,
    }
  }

  async generatePdf(
    year: number,
    birthNumber: string,
    type: TaxType,
    order: number,
  ): Promise<string> {
    const taxDefinition = getTaxDefinitionByType(type)
    if (!taxDefinition) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorTaxTypesEnum.TAX_TYPE_NOT_FOUND,
        `Tax type ${type} not found`,
      )
    }

    if (!taxDefinition.pdfOptions.generate) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorTaxTypesEnum.PDF_GENERATE_ERROR,
        `PDF generation for tax type ${type} is not supported`,
      )
    }

    try {
      const user = await this.getTaxByYearAndType(
        year,
        birthNumber,
        type,
        order,
      )
      const taxDetails = taxDefinition.pdfOptions.taxDetailsToPdf(
        user.taxDetails,
      )
      const totals = taxDefinition.pdfOptions.taxTotalsToPdf(
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
    type: TaxType,
    order: number,
  ): Promise<ResponseTaxSummaryDetailDto> {
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
    if (!taxDefinition) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorTaxTypesEnum.TAX_TYPE_NOT_FOUND,
        `Tax definition for type ${type} not found`,
      )
    }

    return getTaxDetailPureForInstallmentGenerator({
      taxId: tax.id,
      taxDefinition,
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
