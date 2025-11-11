import { DeliveryMethodNamed, TaxPaymentSource } from '@prisma/client'

export enum BloomreachEventNameEnum {
  TAX = 'tax',
  TAX_PAYMENT = 'tax_payment',
  UNPAID_TAX_REMINDER = 'unpaid_tax_reminder',
}

export type TaxPaymentBloomreachData = {
  year: number
  amount: number
  payment_source: TaxPaymentSource
  suppress_email: boolean
}

export type TaxBloomreachData = {
  year: number
  amount: number
  delivery_method: DeliveryMethodNamed | null
}

export type UnpaidTaxReminderBloomreachData = {
  year: number
}
