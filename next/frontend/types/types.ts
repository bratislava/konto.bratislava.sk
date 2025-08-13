import { TaxPaidStatusEnum } from 'openapi-clients/tax'

export const WAITING_FOR_PROCESSING_STATUS = 'WAITING_FOR_PROCESSING' as const

export const TaxPaidStatusAllEnum = {
  ...TaxPaidStatusEnum,
  WaitingForProcessing: WAITING_FOR_PROCESSING_STATUS,
}

export type TaxPaidStatusAllType = (typeof TaxPaidStatusAllEnum)[keyof typeof TaxPaidStatusAllEnum]

export const PaymentMethod = {
  RemainingAmount: 'zvysna-suma',
  Installments: 'splatky',
} as const

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod]
