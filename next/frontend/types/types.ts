export const PaymentMethod = {
  RemainingAmount: 'zvysna-suma',
  Installments: 'splatky',
} as const

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod]
