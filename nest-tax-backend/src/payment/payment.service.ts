import { Injectable } from '@nestjs/common'
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
import { ErrorThrowerGuard } from 'src/utils/guards/errors.guard'
import { computeIsPayableYear } from 'src/utils/helpers/payment.helper'
import { CityAccountSubservice } from 'src/utils/subservices/cityaccount.subservice'
import { GpWebpaySubservice } from 'src/utils/subservices/gpwebpay.subservice'
import { TaxPaymentWithTaxYear } from 'src/utils/types/types.prisma'

import { PaymentRedirectStateEnum } from './dtos/redirect.payent.dto'

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private gpWebpaySubservice: GpWebpaySubservice,
    private errorThrowerGuard: ErrorThrowerGuard,
    private cityAccountSubservice: CityAccountSubservice,
    private bloomreachService: BloomreachService,
  ) {}

  private async getPaymentUrl(tax: Tax): Promise<string> {
    let taxPayment: TaxPaymentWithTaxYear
    try {
      taxPayment = await this.prisma.taxPayment.findFirst({
        where: {
          status: PaymentStatus.SUCCESS,
          taxId: tax.id,
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
      throw this.errorThrowerGuard.paymentDatabaseError(
        'Can not load data from taxPayment',
      )
    }

    if (taxPayment) {
      throw this.errorThrowerGuard.paymentAlreadyPayed()
    }

    const isPayable = computeIsPayableYear(tax.year)
    if (!isPayable) {
      throw this.errorThrowerGuard.taxNotPayable()
    }

    let orderId: string
    let payment: TaxPayment
    try {
      orderId = Date.now().toString()
      payment = await this.prisma.taxPayment.create({
        data: { orderId, amount: tax.amount, taxId: tax.id },
      })
    } catch (error) {
      throw this.errorThrowerGuard.paymentDatabaseError('Can not create order')
    }

    try {
      const requestData = {
        MERCHANTNUMBER: process.env.PAYGATE_MERCHANT_NUMBER,
        OPERATION: 'CREATE_ORDER',
        ORDERNUMBER: orderId,
        AMOUNT: payment.amount.toString(),
        CURRENCY: process.env.PAYGATE_CURRENCY,
        DEPOSITFLAG: '1',
        URL: process.env.PAYGATE_REDIRECT_URL,
        DESCRIPTION: `Platba za dane pre BA s id dane ${tax.id}`,
        PAYMETHODS: `APAY,GPAY,CRD`,
      }
      console.log(requestData)
      const signedData = this.gpWebpaySubservice.getSignedData(requestData)
      return `${process.env.PAYGATE_PAYMENT_REDIRECT_URL}?${formurlencoded(
        signedData,
        {
          ignorenull: true,
        },
      )}`
    } catch (error) {
      throw this.errorThrowerGuard.paymentGenerateUrlError(error)
    }
  }

  async redirectToPayGateByTaxId(uuid: string) {
    let tax: Tax
    try {
      tax = await this.prisma.tax.findUnique({
        where: {
          uuid,
        },
      })
    } catch (error) {
      this.errorThrowerGuard.paymentDatabaseError('Get tax error')
    }

    if (!tax) {
      this.errorThrowerGuard.paymentTaxNotFound()
    }

    return this.getPaymentUrl(tax)
  }

  async getPayGateUrlByUserAndYear(year: string, birthNumber: string) {
    let taxPayer: TaxPayer
    try {
      taxPayer = await this.prisma.taxPayer.findUnique({
        where: { birthNumber },
      })
    } catch (error) {
      this.errorThrowerGuard.paymentDatabaseError('Get taxpayer error')
    }

    if (!taxPayer) {
      this.errorThrowerGuard.paymentTaxNotFound()
    }

    let tax: Tax
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
      this.errorThrowerGuard.paymentDatabaseError('Get tax error')
    }

    if (!tax) {
      this.errorThrowerGuard.paymentTaxNotFound()
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
  }): Promise<string> {
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
          where: { orderId: payment.orderId },
          data: {
            status: PaymentStatus.FAIL,
            source: 'CARD',
          },
        })
        return `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.PAYMENT_FAILED}`
      }

      const taxPayment = await this.prisma.taxPayment.update({
        where: { orderId: payment.orderId },
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
      throw this.errorThrowerGuard.paymentResponseRedirectError(error)
    }
  }

  async getQrCodeByTaxUuid(uuid: string): Promise<string> {
    const qrBase64 = await this.prisma.tax.findUnique({ where: { uuid } })
    return qrBase64.qrCodeEmail
  }
}
