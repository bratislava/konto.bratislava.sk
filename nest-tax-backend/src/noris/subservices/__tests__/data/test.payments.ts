import { NorisTaxPayment } from '../../../types/noris.types'

export const testPaymentValid: NorisTaxPayment = {
  variabilny_symbol: '1234567890',
  uhrazeno: 1000,
}

export const testPaymentStringUhrazeno = {
  variabilny_symbol: '1234567892',
  uhrazeno: '1000',
}

export const testPaymentInvalidVariabilnySymbol = {
  variabilny_symbol: true,
  uhrazeno: 1500,
}
