import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { DataModel, generate, PaymentOptions } from 'bysquare'
import * as qrCode from 'qrcode'

import { QrCodeGeneratorDto } from './dtos/qrcode.dto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class QrCodeSubservice {

  private readonly paymentQrIban: string

  constructor(private readonly configService: ConfigService) {
    this.paymentQrIban = this.configService.getOrThrow<string>('PAYMENT_QR_IBAN')
  }

  async createQrCode(qrCodeData: QrCodeGeneratorDto) {
    const model: DataModel = {
      invoiceId: randomUUID(),
      payments: [
        {
          type: PaymentOptions.PaymentOrder,
          amount: qrCodeData.amount / 100,
          bankAccounts: [{ iban: this.paymentQrIban }],
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
