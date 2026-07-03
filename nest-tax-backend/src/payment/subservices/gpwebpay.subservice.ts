import crypto from 'node:crypto'

import { Injectable } from '@nestjs/common'

import BaConfigService from '../../config/ba-config.service'
import { TaxType } from '../../generated/prisma/client'
import {
  CreateOrderData,
  PaymentResponseQueryToVerifyDto,
  SignedOrderData,
} from '../dtos/gpwebpay.dto'

@Injectable()
export class GpWebpaySubservice {
  constructor(private readonly baConfigService: BaConfigService) {}

  private readonly getDataToSign = (data: CreateOrderData): string => {
    const digestData: (keyof CreateOrderData)[] = [
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

    const { key, passphrase } = this.baConfigService.paygate[taxType]
    const signature = signer.sign(
      {
        key,
        passphrase,
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
      this.baConfigService.paygate[taxType].signCert,
      digest,
      'base64',
    )
  }
}
