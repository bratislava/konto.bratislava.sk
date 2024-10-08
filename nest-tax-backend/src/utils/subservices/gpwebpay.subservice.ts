// TODO
/* eslint-disable unicorn/no-array-reduce */
import crypto from 'node:crypto'

import { Injectable } from '@nestjs/common'

import {
  CreateOrderData,
  PaymentErrorStatus,
  SignedOrderData,
} from './dtos/gpwebpay.dto'

@Injectable()
export class GpWebpaySubservice {
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

  getDataToVerify = (data): string => {
    const digestData = [
      'OPERATION',
      'ORDERNUMBER',
      'PRCODE',
      'SRCODE',
      'RESULTTEXT',
    ]

    return digestData
      .reduce(
        (string, item) => (data[item] ? `${string}|${data[item]}` : string),
        '',
      )
      .slice(1)
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private getPaymentErrorMessage = ({ PRCODE, SRCODE }): PaymentErrorStatus => {
    const pr = Number(PRCODE)
    const sr = Number(SRCODE)

    if ([32, 38].includes(pr)) {
      return PaymentErrorStatus.incorrectData
    }
    if ([25, 40, 85, 300].includes(pr)) {
      return PaymentErrorStatus.paymentDenied
    }
    if ([26, 1000].includes(pr)) {
      return PaymentErrorStatus.techProblem
    }
    if (pr === 28) {
      if (sr === 3000) {
        return PaymentErrorStatus.incorrectData
      }
      if (sr === 3008) {
        return PaymentErrorStatus.paymentDenied
      }
      if ([3005, 3006, 3007].includes(sr)) {
        return PaymentErrorStatus.techProblem
      }
    } else if (pr === 30) {
      if (sr === 1003) {
        return PaymentErrorStatus.incorrectData
      }
      if ([1001, 1002, 1005]) {
        return PaymentErrorStatus.paymentDenied
      }
      if (sr === 1004) {
        return PaymentErrorStatus.techProblem
      }
    }

    return PaymentErrorStatus.unknownError
  }

  getSignedData(data: CreateOrderData): SignedOrderData {
    const signer = crypto.createSign('SHA1')

    signer.write(this.getDataToSign(data))
    signer.end()

    const key = process.env.PAYGATE_KEY
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

    return verifier.verify(process.env.PAYGATE_SIGN_CERT, digest, 'base64')
  }
}
