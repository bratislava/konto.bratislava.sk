import { NorisTaxPayment } from '../../../types/noris.types'

export const testPaymentValid: NorisTaxPayment = {
  variabilny_symbol: '1234567890',
  uhrazeno: 1000,
  datum_posledni_platby: new Date(),
}

export const testPaymentStringUhrazeno = {
  variabilny_symbol: '1234567892',
  uhrazeno: '1000',
  datum_posledni_platby: new Date(),
}

export const testPaymentInvalidVariabilnySymbol = {
  variabilny_symbol: true,
  uhrazeno: 1500,
}
