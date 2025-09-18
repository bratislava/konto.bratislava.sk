import crypto from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import {
  CreateOrderData,
  PaymentResponseQueryToVerifyDto,
  SignedOrderData,
} from './dtos/gpwebpay.dto'

@Injectable()
export class GpWebpaySubservice {
  constructor(private readonly configService: ConfigService) {
    // Check for the existence of the environment variables
    this.configService.getOrThrow<string>('PAYGATE_SIGN_CERT')
  }

  private readonly getDataToSign = (data: CreateOrderData): string => {
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

    const validValues = digestData
      .filter((item) => data[item])
      .map((item) => data[item])

    return validValues.join('|')
  }

  getDataToVerify = (data: PaymentResponseQueryToVerifyDto): string => {
    const digestData = [
      'OPERATION',
      'ORDERNUMBER',
      'PRCODE',
      'SRCODE',
      'RESULTTEXT',
    ]

    const validValues = digestData
      .filter((item) => data[item as keyof PaymentResponseQueryToVerifyDto])
      .map((item) => data[item as keyof PaymentResponseQueryToVerifyDto])

    return validValues.join('|')
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
