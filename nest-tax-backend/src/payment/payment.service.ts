import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  PaymentStatus,
  Prisma,
  Tax,
  TaxPayer,
  TaxPayment,
  TaxPaymentSource,
  TaxType,
} from '@prisma/client'
import formurlencoded from 'form-urlencoded'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { PrismaService } from '../prisma/prisma.service'
import { TaxService } from '../tax/tax.service'
import { ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { PaymentResponseQueryDto } from '../utils/subservices/dtos/gpwebpay.dto'
import { GpWebpaySubservice } from '../utils/subservices/gpwebpay.subservice'
import { TaxPaymentWithTaxYear } from '../utils/types/types.prisma'
import {
  CustomErrorPaymentResponseTypesEnum,
  CustomErrorPaymentTypesEnum,
  CustomErrorPaymentTypesResponseEnum,
} from './dtos/error.dto'
import { PaymentGateURLGeneratorDto } from './dtos/generator.dto'
import { PaymentRedirectStateEnum } from './dtos/redirect.payent.dto'
import { computeIsPayableYear } from './utils/payment.helper'

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gpWebpaySubservice: GpWebpaySubservice,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly bloomreachService: BloomreachService,
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly taxService: TaxService,
  ) {}

  private async getTaxPaymentByTaxId(
    id: number,
  ): Promise<TaxPaymentWithTaxYear | null> {
    try {
      return await this.prisma.taxPayment.findFirst({
        where: {
          status: PaymentStatus.SUCCESS,
          taxId: id,
        },
        include: {
          tax: {
            select: {
              year: true,
            },
          },
        },
      })
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.DATABASE_ERROR,
        'Can not load data from taxPayment',
        'Database error',
        undefined,
        error,
      )
    }
  }

  /**
   * @internal
   * DO NOT EXPOSE THIS METHOD DIRECTLY IN CONTROLLERS!
   * This method is meant for internal module use only and contains no checks.
   */
  private async getPaymentUrlInternal(options: PaymentGateURLGeneratorDto) {
    let orderId: string
    let payment: TaxPayment
    try {
      orderId = Date.now().toString()
      payment = await this.prisma.taxPayment.create({
        data: { orderId, amount: options.amount, taxId: options.taxId },
      })
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.DATABASE_ERROR,
        'Can not create order',
        'Database error',
        undefined,
        error,
      )
    }

    try {
      // data that goes to payment gateway should not contain diacritics
      const requestData = {
        MERCHANTNUMBER: this.configService.getOrThrow<string>(
          'PAYGATE_MERCHANT_NUMBER',
        ),
        OPERATION: 'CREATE_ORDER',
        ORDERNUMBER: orderId,
        AMOUNT: payment.amount.toString(),
        CURRENCY: this.configService.getOrThrow<string>('PAYGATE_CURRENCY'),
        DEPOSITFLAG: '1',
        URL: this.configService.getOrThrow<string>('PAYGATE_REDIRECT_URL'),
        DESCRIPTION: options.description,
        PAYMETHODS: `APAY,GPAY,CRD`,
      }
      const signedData = this.gpWebpaySubservice.getSignedData(requestData)
      return `${this.configService.getOrThrow<string>('PAYGATE_PAYMENT_REDIRECT_URL')}?${formurlencoded(
        signedData,
        {
          ignorenull: true,
        },
      )}`
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.CREATE_PAYMENT_URL,
        'Can not create url',
        'Create url error',
        undefined,
        error,
      )
    }
  }

  async generateFullPaymentLink(
    where: Prisma.TaxPayerWhereUniqueInput,
    year: number,
    type: TaxType,
    order: number,
  ) {
    const generator = await this.taxService.getOneTimePaymentGenerator(
      where,
      year,
      type,
      order,
    )

    return this.getPaymentUrlInternal(generator)
  }

  async generateInstallmentPaymentLink(
    where: Prisma.TaxPayerWhereUniqueInput,
    year: number,
    type: TaxType,
    order: number,
  ) {
    const generator = await this.taxService.getInstallmentPaymentGenerator(
      where,
      year,
      type,
      order,
    )

    return this.getPaymentUrlInternal(generator)
  }

  private async getPaymentUrl(tax: Tax): Promise<string> {
    const taxPayment: TaxPaymentWithTaxYear | null =
      await this.getTaxPaymentByTaxId(tax.id)

    if (taxPayment) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.PAYMENT_ALREADY_PAID,
        'Payment or part of payment or some installment was already paid, you can not pay whole amount',
        'Already paid',
      )
    }

    const isPayable = computeIsPayableYear(tax.year)
    if (!isPayable) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.OLD_TAX_NOT_PAYABLE,
        CustomErrorPaymentTypesResponseEnum.OLD_TAX_NOT_PAYABLE,
        'Not payable',
      )
    }

    let orderId: string
    let payment: TaxPayment
    try {
      orderId = Date.now().toString()
      payment = await this.prisma.taxPayment.create({
        data: { orderId, amount: tax.amount, taxId: tax.id },
      })
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.DATABASE_ERROR,
        'Can not create order',
        'Database error',
        undefined,
        error,
      )
    }

    try {
      const requestData = {
        MERCHANTNUMBER: this.configService.getOrThrow<string>(
          'PAYGATE_MERCHANT_NUMBER',
        ),
        OPERATION: 'CREATE_ORDER',
        ORDERNUMBER: orderId,
        AMOUNT: payment.amount.toString(),
        CURRENCY: this.configService.getOrThrow<string>('PAYGATE_CURRENCY'),
        DEPOSITFLAG: '1',
        URL: this.configService.getOrThrow<string>('PAYGATE_REDIRECT_URL'),
        DESCRIPTION: `Platba za dane pre BA s id dane ${tax.id}`,
        PAYMETHODS: `APAY,GPAY,CRD`,
      }
      const signedData = this.gpWebpaySubservice.getSignedData(requestData)
      return `${this.configService.getOrThrow<string>('PAYGATE_PAYMENT_REDIRECT_URL')}?${formurlencoded(
        signedData,
        {
          ignorenull: true,
        },
      )}`
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.CREATE_PAYMENT_URL,
        'Can not create url',
        'Create url error',
        undefined,
        error,
      )
    }
  }

  async redirectToPayGateByTaxId(uuid: string) {
    let tax: Tax | null = null
    try {
      tax = await this.prisma.tax.findUnique({
        where: {
          uuid,
        },
      })
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.DATABASE_ERROR,
        'Get tax error',
        'Database error',
        undefined,
        error,
      )
    }

    if (!tax) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.TAX_NOT_FOUND,
        ErrorsResponseEnum.NOT_FOUND_ERROR,
        'Tax was not found',
      )
    }

    return this.getPaymentUrl(tax)
  }

  async getPayGateUrlByUserYearType(
    year: string,
    birthNumber: string,
    type: TaxType,
    order: number,
  ) {
    let taxPayer: TaxPayer | null = null
    try {
      taxPayer = await this.prisma.taxPayer.findUnique({
        where: { birthNumber },
      })
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.DATABASE_ERROR,
        'Get taxpayer error',
        'Database error',
        undefined,
        error,
      )
    }

    if (!taxPayer) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.TAX_NOT_FOUND,
        ErrorsResponseEnum.NOT_FOUND_ERROR,
        'Tax was not found',
      )
    }

    let tax: Tax | null = null
    try {
      tax = await this.prisma.tax.findUnique({
        where: {
          taxPayerId_year_type_order: {
            taxPayerId: taxPayer.id,
            year: +year,
            type,
            order,
          },
        },
      })
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.DATABASE_ERROR,
        'Get tax error',
        'Database error',
        undefined,
        error,
      )
    }

    if (!tax) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.TAX_NOT_FOUND,
        ErrorsResponseEnum.NOT_FOUND_ERROR,
        'Tax was not found',
      )
    }

    return this.getPaymentUrl(tax)
  }

  async processPaymentResponse({
    OPERATION,
    ORDERNUMBER,
    PRCODE,
    SRCODE,
    DIGEST,
    DIGEST1,
    RESULTTEXT,
  }: PaymentResponseQueryDto): Promise<string> {
    if (!ORDERNUMBER) {
      return `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.FAILED_TO_VERIFY}`
    }
    try {
      const dataToVerify = this.gpWebpaySubservice.getDataToVerify({
        OPERATION,
        ORDERNUMBER,
        PRCODE,
        SRCODE,
        RESULTTEXT,
      })
      if (
        !(
          this.gpWebpaySubservice.verifyData(dataToVerify, DIGEST) &&
          this.gpWebpaySubservice.verifyData(
            `${dataToVerify}|${process.env.PAYGATE_MERCHANT_NUMBER}`,
            DIGEST1,
          )
        )
      ) {
        await this.prisma.taxPayment.update({
          where: { orderId: ORDERNUMBER },
          data: {
            status: PaymentStatus.FAIL,
            source: 'CARD',
          },
        })
        return `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.FAILED_TO_VERIFY}`
      }

      const payment = await this.prisma.taxPayment.findUnique({
        where: {
          orderId: ORDERNUMBER,
        },
        include: {
          tax: {
            include: {
              taxPayer: true,
            },
          },
        },
      })

      if (!payment) {
        return `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.PAYMENT_FAILED}`
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        return `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.PAYMENT_ALREADY_PAID}`
      }

      // TODO: when user has taxPayment with status SUCCESS,
      // it will be updated to FAIL in case of retry payment and failing payment
      // https://github.com/bratislava/private-konto.bratislava.sk/issues/1030
      if (!(Number(PRCODE) === 0 && Number(SRCODE) === 0)) {
        await this.prisma.taxPayment.update({
          where: { orderId: ORDERNUMBER },
          data: {
            status: PaymentStatus.FAIL,
            source: 'CARD',
          },
        })
        return `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.PAYMENT_FAILED}`
      }

      const taxPayment = await this.prisma.taxPayment.update({
        where: { orderId: ORDERNUMBER },
        data: {
          status: PaymentStatus.SUCCESS,
          source: 'CARD',
        },
        include: {
          tax: {
            select: {
              year: true,
              type: true,
              order: true,
            },
          },
        },
      })

      const user = await this.cityAccountSubservice.getUserDataAdmin(
        payment.tax.taxPayer.birthNumber,
      )
      if (user?.externalId) {
        await this.bloomreachService.trackEventTaxPayment(
          {
            amount: taxPayment.amount,
            payment_source: TaxPaymentSource.CARD,
            year: taxPayment.tax.year,
            taxType: taxPayment.tax.type,
            order: taxPayment.tax.order!, // non-null by DB trigger
          },
          user.externalId,
        )
      }

      return `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.PAYMENT_SUCCESS}`
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentResponseTypesEnum.PAYMENT_RESPONSE_ERROR,
        'Error to redirect to response',
        'Error to redirect',
        undefined,
        error,
      )
    }
  }
}
