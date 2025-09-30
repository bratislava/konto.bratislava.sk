import { PaymentStatus, TaxDetail } from '@prisma/client'

import { QrCodeGeneratorDto } from '../../utils/subservices/dtos/qrcode.dto'
import {
  ResponseActiveInstallmentDto,
  ResponseInstallmentPaymentDetailDto,
  ResponseOneTimePaymentDetailsDto,
  ResponseTaxDetailItemizedDto,
} from '../dtos/response.tax.dto'

export type ReplaceQrCodeWithGeneratorDto<T extends object> = {
  [K in keyof T]: K extends 'qrCode' ? QrCodeGeneratorDto : T[K]
}

export type GetTaxDetailPureOptions = {
  taxYear: number // daňový rok
  today: Date // aktuálny dátum
  overallAmount: number // suma na zaplatenie
  paymentCalendarThreshold: number // splátková hranica (66 Eur)
  variableSymbol: string
  dateOfValidity: Date | null // dátum právoplatnosti
  installments: { order: number; amount: number }[]
  taxDetails: TaxDetail[]
  taxConstructions: number
  taxFlat: number
  taxLand: number
  specificSymbol: string
  taxPayments: {
    amount: number
    status: PaymentStatus
  }[]
}

export type GetTaxDetailPureResponse = {
  overallPaid: number
  overallBalance: number
  overallAmount: number
  oneTimePayment: ReplaceQrCodeWithGeneratorDto<ResponseOneTimePaymentDetailsDto>
  installmentPayment: Omit<
    ResponseInstallmentPaymentDetailDto,
    'activeInstallment'
  > & {
    activeInstallment?: ReplaceQrCodeWithGeneratorDto<ResponseActiveInstallmentDto>
  }
  itemizedDetail: ResponseTaxDetailItemizedDto
}
