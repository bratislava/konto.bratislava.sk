import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  PaymentStatus,
  Tax,
  TaxPayer,
  TaxPayment,
  TaxPaymentSource,
} from '@prisma/client'
import formurlencoded from 'form-urlencoded'
import { BloomreachService } from 'src/bloomreach/bloomreach.service'
import { PrismaService } from 'src/prisma/prisma.service'
import ThrowerErrorGuard from 'src/utils/guards/errors.guard'
import { computeIsPayableYear } from 'src/utils/helpers/payment.helper'
import { CityAccountSubservice } from 'src/utils/subservices/cityaccount.subservice'
import { GpWebpaySubservice } from 'src/utils/subservices/gpwebpay.subservice'
import { TaxPaymentWithTaxYear } from 'src/utils/types/types.prisma'

import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../tax/dtos/error.dto'
import { ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import { PaymentResponseQueryDto } from '../utils/subservices/dtos/gpwebpay.dto'
import {
  CustomErrorPaymentResponseTypesEnum,
  CustomErrorPaymentTypesEnum,
  CustomErrorPaymentTypesResponseEnum,
} from './dtos/error.dto'
import { PaymentRedirectStateEnum } from './dtos/redirect.payent.dto'

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gpWebpaySubservice: GpWebpaySubservice,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly bloomreachService: BloomreachService,
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  private async getTaxPaumentByTaxId(
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
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
      )
    }
  }

  private async getPaymentUrl(tax: Tax): Promise<string> {
    const taxPayment: TaxPaymentWithTaxYear | null =
      await this.getTaxPaumentByTaxId(tax.id)

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
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
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
      return `${process.env.PAYGATE_PAYMENT_REDIRECT_URL}?${formurlencoded(
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
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
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
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
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

  async getPayGateUrlByUserAndYear(year: string, birthNumber: string) {
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
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
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
          taxPayerId_year: {
            taxPayerId: taxPayer.id,
            year: +year,
          },
        },
      })
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.DATABASE_ERROR,
        'Get tax error',
        'Database error',
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
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
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async getQrCodeByTaxUuid(uuid: string): Promise<string> {
    const qrBase64 = await this.prisma.tax.findUnique({ where: { uuid } })
    if (!qrBase64) {
      throw this.throwerErrorGuard.NotFoundException(
        CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
      )
    }
    if (!qrBase64.qrCodeEmail) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPaymentTypesEnum.QR_CODE_NOT_FOUND,
        CustomErrorPaymentTypesResponseEnum.QR_CODE_NOT_FOUND,
      )
    }
    return qrBase64.qrCodeEmail
  }
}
