import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  PaymentStatus,
  Prisma,
  TaxPayment,
  TaxPaymentSource,
  TaxType,
} from '@prisma/client'
import formurlencoded from 'form-urlencoded'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { PrismaService } from '../prisma/prisma.service'
import { TaxService } from '../tax/tax.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { TaxPaymentWithTaxInfo } from '../utils/types/types.prisma'
import { RetryService } from '../utils-module/retry.service'
import {
  CustomErrorNorisTypesResponseEnum,
  CustomErrorPaymentResponseTypesEnum,
  CustomErrorPaymentTypesEnum,
} from './dtos/error.dto'
import { PaymentGateURLGeneratorDto } from './dtos/generator.dto'
import { PaymentResponseQueryDto } from './dtos/gpwebpay.dto'
import { PaymentRedirectStateEnum } from './dtos/redirect.payent.dto'
import {
  GP_WEBPAY_CONFIG_KEY_MAP,
  GpWebpaySubservice,
} from './subservices/gpwebpay.subservice'

interface GpWebpayProcessingStrategy {
  dbStatus: 'SUCCESS' | 'NEW_TO_FAILED' | 'KEEP_CURRENT'
  shouldAlert: boolean
  feState: PaymentRedirectStateEnum
}

@Injectable()
export class PaymentService {
  private readonly logger = new LineLoggerSubservice('PaymentService')

  constructor(
    private readonly prisma: PrismaService,
    private readonly gpWebpaySubservice: GpWebpaySubservice,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly bloomreachService: BloomreachService,
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly taxService: TaxService,
    private readonly retryService: RetryService,
  ) {}

  private getRedirectUrl(taxType: TaxType) {
    const redirectUrl = this.configService.getOrThrow<string>(
      'PAYGATE_REDIRECT_URL',
    )

    const url = new URL(redirectUrl)

    const basePath = url.pathname.endsWith('/')
      ? url.pathname
      : `${url.pathname}/`

    return new URL(taxType, `${url.origin}${basePath}`).toString()
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
        data: {
          orderId,
          amount: options.amount,
          taxId: options.taxId,
          bloomreachEventSent: false,
        },
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
      const redirectUrl = this.getRedirectUrl(options.taxType)
      const requestData = {
        MERCHANTNUMBER: this.configService.getOrThrow<string>(
          GP_WEBPAY_CONFIG_KEY_MAP[options.taxType].PAYGATE_MERCHANT_NUMBER,
        ),
        OPERATION: 'CREATE_ORDER',
        ORDERNUMBER: orderId,
        AMOUNT: payment.amount.toString(),
        CURRENCY: this.configService.getOrThrow<string>('PAYGATE_CURRENCY'),
        DEPOSITFLAG: '1',
        URL: redirectUrl,
        DESCRIPTION: options.description,
        PAYMETHODS: `APAY,GPAY,CRD`,
      }
      const signedData = this.gpWebpaySubservice.getSignedData(
        options.taxType,
        requestData,
      )
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

  /**
   * Tracks the payment in Bloomreach and updates the tax payment bloomreachEventSent flag.
   * This is to prevent missing payments in Bloomreach in case of some failure in the tracking process.
   *
   * Note that we first set the flag to true in the transaction, and then send the event. The reason is that
   * if the event fails, the transaction will be rolled back, and the flag will not be set.
   * If the event succeeds, the flag will be set to true.
   *
   * @param taxPayment - Tax payment to track in Bloomreach
   * @param externalId - External ID of the user
   */
  async trackPaymentInBloomreach(
    taxPayment: TaxPaymentWithTaxInfo,
    externalId?: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.taxPayment.update({
        where: { id: taxPayment.id },
        data: { bloomreachEventSent: true },
      })

      if (!externalId) {
        return
      }

      const result = await this.bloomreachService.trackEventTaxPayment(
        {
          amount: taxPayment.amount,
          payment_source: taxPayment.source ?? TaxPaymentSource.BANK_ACCOUNT,
          year: taxPayment.tax.year,
          tax_type: taxPayment.tax.type,
          order: taxPayment.tax.order!, // non-null by DB trigger and constraint
          suppress_email: false,
        },
        externalId,
      )
      if (!result) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to track payment in Bloomreach.',
        )
      }
    })
  }

  async processPaymentResponse(
    taxType: TaxType,
    {
      OPERATION,
      ORDERNUMBER,
      PRCODE,
      SRCODE,
      DIGEST,
      DIGEST1,
      RESULTTEXT,
    }: PaymentResponseQueryDto,
  ): Promise<string> {
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
          this.gpWebpaySubservice.verifyData(taxType, dataToVerify, DIGEST) &&
          this.gpWebpaySubservice.verifyData(
            taxType,
            `${dataToVerify}|${this.configService.getOrThrow<string>(GP_WEBPAY_CONFIG_KEY_MAP[taxType].PAYGATE_MERCHANT_NUMBER)}`,
            DIGEST1,
          )
        )
      ) {
        // We failed to verify this payment. If we have any side effects here, they can be triggered
        // by just guessing the ORDERNUMBER we generate as a timestamp.
        return `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.FAILED_TO_VERIFY}`
      }

      const taxPaymentWithTax: Prisma.TaxPaymentGetPayload<{
        include: { tax: { include: { taxPayer: true } } }
      }> | null = await this.prisma.taxPayment.findUnique({
        where: { orderId: ORDERNUMBER },
        include: { tax: { include: { taxPayer: true } } },
      })

      if (!taxPaymentWithTax) {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            CustomErrorPaymentTypesEnum.TAX_NOT_FOUND,
            CustomErrorNorisTypesResponseEnum.TAX_NOT_FOUND,
            undefined,
            `We received a valid payment response for payment we do not have in our database. ORDERNUMBER: ${ORDERNUMBER}`,
          ),
        )
        return `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.PAYMENT_FAILED}`
      }

      const strategy = this.getProcessingStrategy(PRCODE)
      const currentStatus = taxPaymentWithTax.status
      const { year, order, type } = taxPaymentWithTax.tax
      const redirectBase = `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${strategy.feState}&taxType=${type}&year=${year}&order=${order}`

      if (strategy.shouldAlert) {
        this.logger.warn({
          message: 'A problematic payment response was detected.',
          PRCODE,
          SRCODE,
          ORDERNUMBER,
          alert: 1,
        })
      }

      let nextStatus: PaymentStatus | undefined
      switch (strategy.dbStatus) {
        case 'SUCCESS':
          nextStatus = PaymentStatus.SUCCESS
          break

        case 'NEW_TO_FAILED':
          nextStatus =
            currentStatus === PaymentStatus.NEW ? PaymentStatus.FAIL : undefined
          break

        default:
          break
      }

      let taxPayment: Prisma.TaxPaymentGetPayload<{
        include: { tax: { select: { year: true; type: true; order: true } } }
      }> | null

      if (nextStatus) {
        taxPayment = await this.prisma.taxPayment.update({
          where: { orderId: ORDERNUMBER },
          data: {
            status: nextStatus,
            source: TaxPaymentSource.CARD,
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
        if (!taxPayment) {
          this.logger.error(
            this.throwerErrorGuard.InternalServerErrorException(
              CustomErrorPaymentTypesEnum.DATABASE_ERROR,
              CustomErrorNorisTypesResponseEnum.DATABASE_ERROR,
              undefined,
              `Database did not return an update TaxPayment after nextStatus was set. ORDERID: ${ORDERNUMBER}, STATUS: ${nextStatus}`,
            ),
          )
          return redirectBase
        }
      } else {
        taxPayment = taxPaymentWithTax
      }

      if (nextStatus === PaymentStatus.SUCCESS) {
        const user = await this.retryService.retryWithDelay(
          () =>
            this.cityAccountSubservice.getUserDataAdmin(
              taxPaymentWithTax.tax.taxPayer.birthNumber,
            ),
          'getUserDataAdmin',
          3,
          1000, // 1 second delay, 3 retries
        )
        await this.trackPaymentInBloomreach(
          taxPayment,
          user?.externalId ?? undefined,
        )
      }

      return `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${strategy.feState}&taxType=${type}&year=${year}&order=${order}`
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

  private getProcessingStrategy(prCode: string): GpWebpayProcessingStrategy {
    const pr = Number(prCode)

    // https://www.gpwebpay.cz/downloads/GP_webpay_HTTP_EN.pdf
    // PR 0: Success
    if (pr === 0) {
      return {
        dbStatus: 'SUCCESS',
        shouldAlert: false,
        feState: PaymentRedirectStateEnum.PAYMENT_SUCCESS,
      }
    }

    // PR 14 or 152: Already Paid / Duplicate
    if (pr === 14 || pr === 152) {
      return {
        dbStatus: 'KEEP_CURRENT',
        shouldAlert: false,
        feState: PaymentRedirectStateEnum.PAYMENT_ALREADY_PAID,
      }
    }

    // PR 31: Security / Digest mismatch
    if (pr === 31) {
      return {
        dbStatus: 'KEEP_CURRENT',
        shouldAlert: true,
        feState: PaymentRedirectStateEnum.FAILED_TO_VERIFY,
      }
    }

    // Technical alerts for PR codes 1-7 (Invalid request), 11 (Unknown merchant), 15-27 (Technical/Connection), 1000 (Gateway problem)
    const technicalAlertPrCodes = [
      1, 2, 3, 4, 5, 6, 7, 11, 15, 16, 17, 18, 20, 25, 26, 27, 1000,
    ]
    if (technicalAlertPrCodes.includes(pr)) {
      return {
        dbStatus: pr <= 27 ? 'NEW_TO_FAILED' : 'KEEP_CURRENT',
        shouldAlert: true,
        feState: PaymentRedirectStateEnum.PAYMENT_FAILED,
      }
    }

    // All other failures (PR 28, 30, 32, 35, 38, 40, 46, 50, 82-85, 500+, SR codes)
    return {
      dbStatus: 'NEW_TO_FAILED',
      shouldAlert: false,
      feState: PaymentRedirectStateEnum.PAYMENT_FAILED,
    }
  }
}
