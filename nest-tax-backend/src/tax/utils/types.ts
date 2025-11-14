import { PaymentStatus, TaxType } from '@prisma/client'

import { QrCodeGeneratorDto } from '../../utils/subservices/dtos/qrcode.dto'
import {
  ResponseActiveInstallmentDto,
  ResponseInstallmentPaymentDetailDto,
  ResponseOneTimePaymentDetailsDto,
  ResponseRealEstateTaxDetailItemizedDto,
} from '../dtos/response.tax.dto'
import { RealEstateTaxDetail } from '../../prisma/json-types'
import {
  TaxTypeToResponseDetailItemizedDto,
  TaxTypeToTaxDetail,
} from '../../tax-definitions/taxDefinitionsTypes'

export type ReplaceQrCodeWithGeneratorDto<T extends object> = {
  [K in keyof T]: K extends 'qrCode' ? QrCodeGeneratorDto : T[K]
}

// TODO generalize for multiple tax types - PKO does not have taxConstructions, taxFlat, taxLand
export type GetTaxDetailPureOptions <TTaxType extends TaxType>  = {
  type: TTaxType
  taxYear: number // daňový rok
  today: Date // aktuálny dátum
  overallAmount: number // suma na zaplatenie
  paymentCalendarThreshold: number // splátková hranica (66 Eur)
  variableSymbol: string
  dateOfValidity: Date | null // dátum právoplatnosti
  installments: { order: number; amount: number }[]
  taxDetails: TaxTypeToTaxDetail[TTaxType]
  specificSymbol: string
  taxPayments: {
    amount: number
    status: PaymentStatus
  }[]
}

export type GetTaxDetailPureResponse <TTaxType extends TaxType> = {
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
  itemizedDetail: TaxTypeToResponseDetailItemizedDto[TTaxType]
}
