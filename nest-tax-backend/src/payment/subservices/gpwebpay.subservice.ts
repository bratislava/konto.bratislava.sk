import crypto from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TaxType } from '@prisma/client'

import {
  CreateOrderData,
  PaymentResponseQueryToVerifyDto,
  SignedOrderData,
} from '../dtos/gpwebpay.dto'

export const GP_WEBPAY_CONFIG_KEYS: Record<
  TaxType,
  {
    PAYGATE_KEY: string
    PAYGATE_SIGN_CERT: string
    PAYGATE_MERCHANT_NUMBER: string
    PAYGATE_PASSPHRASE: string
  }
> = {
  [TaxType.DZN]: {
    PAYGATE_KEY: 'PAYGATE_KEY',
    PAYGATE_SIGN_CERT: 'PAYGATE_SIGN_CERT',
    PAYGATE_MERCHANT_NUMBER: 'PAYGATE_MERCHANT_NUMBER',
    PAYGATE_PASSPHRASE: 'PAYGATE_PASSPHRASE',
  },
  [TaxType.KO]: {
    PAYGATE_KEY: 'PAYGATE_KEY_KO',
    PAYGATE_SIGN_CERT: 'PAYGATE_SIGN_CERT_KO',
    PAYGATE_MERCHANT_NUMBER: 'PAYGATE_MERCHANT_NUMBER_KO',
    PAYGATE_PASSPHRASE: 'PAYGATE_PASSPHRASE_KO',
  },
}
// TODO finalize all calls

@Injectable()
export class GpWebpaySubservice {
  constructor(private readonly configService: ConfigService) {}

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

  getSignedData(taxType: TaxType, data: CreateOrderData): SignedOrderData {
    const signer = crypto.createSign('SHA1')

    signer.write(this.getDataToSign(data))
    signer.end()

    const key = this.configService.getOrThrow<string>(
      GP_WEBPAY_CONFIG_KEYS[taxType].PAYGATE_KEY,
    )
    const signature = signer.sign(
      {
        key,
        passphrase: this.configService.getOrThrow<string>(
          GP_WEBPAY_CONFIG_KEYS[taxType].PAYGATE_PASSPHRASE,
        ),
      },
      'base64',
    )

    return {
      ...data,
      DIGEST: signature,
    }
  }

  verifyData(taxType: TaxType, data: string, digest: string) {
    const verifier = crypto.createVerify('SHA1')

    verifier.write(data)
    verifier.end()

    return verifier.verify(
      this.configService.getOrThrow<string>(
        GP_WEBPAY_CONFIG_KEYS[taxType].PAYGATE_SIGN_CERT,
      ),
      digest,
      'base64',
    )
  }
}
