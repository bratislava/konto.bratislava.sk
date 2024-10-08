import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { DataModel, generate, PaymentOptions } from 'bysquare'
import * as qrCode from 'qrcode'

import { QrCodeGeneratorDto } from './dtos/qrcode.dto'

@Injectable()
export class QrCodeSubservice {
  async createQrCode(qrCodeData: QrCodeGeneratorDto) {
    const model: DataModel = {
      invoiceId: randomUUID(),
      payments: [
        {
          type: PaymentOptions.PaymentOrder,
          amount: qrCodeData.amount / 100,
          bankAccounts: [{ iban: process.env.PAYMENT_QR_IBAN }],
          currencyCode: 'EUR',
          constantSymbol: process.env.PAYMENT_QR_CONSTANT_SYMBOL,
          variableSymbol: qrCodeData.variableSymbol,
          specificSymbol: qrCodeData.specificSymbol,
        },
      ],
    }

    const qr = generate(model)
    const qr_result = await qrCode.toBuffer(qr)
    return qr_result.toString('base64')
  }
}
