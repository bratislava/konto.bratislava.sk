/* eslint-disable unicorn/no-array-reduce */
import crypto from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import {
  CreateOrderData,
  PaymentErrorStatus,
  PaymentResponseQueryToVerifyDto,
  SignedOrderData,
} from './dtos/gpwebpay.dto'

@Injectable()
export class GpWebpaySubservice {
  constructor(private readonly configService: ConfigService) {
    // Check for the existence of the environment variables
    this.configService.getOrThrow<string>('PAYGATE_SIGN_CERT')
  }

  private getDataToSign = (data: CreateOrderData): string => {
    const digestData: Array<keyof CreateOrderData> = [
      'MERCHANTNUMBER',
      'OPERATION',
      'ORDERNUMBER',
      'AMOUNT',
      'CURRENCY',
      'DEPOSITFLAG',
      'URL',
      'DESCRIPTION',
      'EMAIL',
      'PAYMETHODS',
    ]

    return digestData
      .reduce(
        (string, item) => (data[item] ? `${string}|${data[item]}` : string),
        '',
      )
      .slice(1)
  }

  getDataToVerify = (data: PaymentResponseQueryToVerifyDto): string => {
    const digestData = [
      'OPERATION',
      'ORDERNUMBER',
      'PRCODE',
      'SRCODE',
      'RESULTTEXT',
    ]

    return digestData
      .reduce(
        (string, item) =>
          data[item as keyof PaymentResponseQueryToVerifyDto]
            ? `${string}|${data[item as keyof PaymentResponseQueryToVerifyDto]}`
            : string,
        '',
      )
      .slice(1)
  }

  private getPaymentErrorMessage = (
    PRCODE: any,
    SRCODE: any,
  ): PaymentErrorStatus => {
    const pr = Number(PRCODE)
    const sr = Number(SRCODE)

    // Direct PR code mappings
    const prCodeMap: Record<number, PaymentErrorStatus> = {
      32: PaymentErrorStatus.incorrectData,
      38: PaymentErrorStatus.incorrectData,
      25: PaymentErrorStatus.paymentDenied,
      40: PaymentErrorStatus.paymentDenied,
      85: PaymentErrorStatus.paymentDenied,
      300: PaymentErrorStatus.paymentDenied,
      26: PaymentErrorStatus.techProblem,
      1000: PaymentErrorStatus.techProblem,
    }

    // Special cases mappings
    const specialCases: Record<number, Record<number, PaymentErrorStatus>> = {
      28: {
        3000: PaymentErrorStatus.incorrectData,
        3008: PaymentErrorStatus.paymentDenied,
        3005: PaymentErrorStatus.techProblem,
        3006: PaymentErrorStatus.techProblem,
        3007: PaymentErrorStatus.techProblem,
      },
      30: {
        1003: PaymentErrorStatus.incorrectData,
        1001: PaymentErrorStatus.paymentDenied,
        1002: PaymentErrorStatus.paymentDenied,
        1005: PaymentErrorStatus.paymentDenied,
        1004: PaymentErrorStatus.techProblem,
      },
    }

    // Check direct PR code mappings
    if (prCodeMap[pr]) {
      return prCodeMap[pr]
    }

    // Check special cases
    if (specialCases[pr]?.[sr]) {
      return specialCases[pr][sr]
    }

    return PaymentErrorStatus.unknownError
  }

  getSignedData(data: CreateOrderData): SignedOrderData {
    const signer = crypto.createSign('SHA1')

    signer.write(this.getDataToSign(data))
    signer.end()

    const key = this.configService.getOrThrow<string>('PAYGATE_KEY')
    const signature = signer.sign(
      {
        key,
        passphrase: process.env.PAYGATE_PASSPHRASE,
      },
      'base64',
    )

    return {
      ...data,
      DIGEST: signature,
    }
  }

  verifyData(data: string, digest: string) {
    const verifier = crypto.createVerify('SHA1')

    verifier.write(data)
    verifier.end()

    return verifier.verify(
      this.configService.getOrThrow<string>('PAYGATE_SIGN_CERT'),
      digest,
      'base64',
    )
  }
}
