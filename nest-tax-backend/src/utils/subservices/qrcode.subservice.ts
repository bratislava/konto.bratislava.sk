import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DataModel, generate, PaymentOptions } from 'bysquare'
import * as qrCode from 'qrcode'

import { QrCodeGeneratorDto } from './dtos/qrcode.dto'

@Injectable()
export class QrCodeSubservice {
  constructor(private readonly configService: ConfigService) {
    // Check if the required environment variables are set
    this.configService.getOrThrow<string>('PAYMENT_QR_IBAN')
    this.configService.getOrThrow<string>('PAYMENT_QR_BENEFICIARY_NAME')
  }

  async createQrCode(qrCodeData: QrCodeGeneratorDto) {
    const model: DataModel = {
      invoiceId: randomUUID(),
      payments: [
        {
          type: PaymentOptions.PaymentOrder,
          amount: qrCodeData.amount / 100,
          bankAccounts: [
            { iban: this.configService.getOrThrow<string>('PAYMENT_QR_IBAN') },
          ],
          beneficiary: {
            name: this.configService.getOrThrow<string>(
              'PAYMENT_QR_BENEFICIARY_NAME',
            ),
          },
          currencyCode: 'EUR',
          variableSymbol: qrCodeData.variableSymbol,
          specificSymbol: qrCodeData.specificSymbol,
          paymentNote: qrCodeData.paymentNote || 'QR_WEB', // TODO we want to delete QR_WEB eventually
        },
      ],
    }

    const qr = generate(model)
    const qr_result = await qrCode.toBuffer(qr)
    return qr_result.toString('base64')
  }
}
