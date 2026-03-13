import { DeliveryMethodNamed, TaxPaymentSource, TaxType } from '@prisma/client'

import { INSTALLMENT_DUE_DATE_TYPE } from '../tasks/utils/types'

export enum BloomreachEventNameEnum {
  TAX = 'tax',
  TAX_PAYMENT = 'tax_payment',
  UNPAID_TAX_REMINDER = 'unpaid_tax_reminder',
  UNPAID_TAX_INSTALLMENT_REMINDER = 'unpaid_tax_installment_reminder',
}

export interface TaxPaymentBloomreachData {
  year: number
  amount: number
  payment_source: TaxPaymentSource
  tax_type: TaxType
  order: number
  suppress_email: boolean
}

export interface TaxBloomreachData {
  year: number
  amount: number
  delivery_method: DeliveryMethodNamed | null
  tax_type: TaxType
  order: number
}

export interface UnpaidTaxReminderBloomreachData {
  year: number
  tax_type: TaxType
  order: number
}

export interface UnpaidTaxInstallmentReminderBloomreachData {
  year: number
  tax_type: TaxType
  order: number
  installment_order: number
  due_date_type: INSTALLMENT_DUE_DATE_TYPE
  due_date_month: number
  due_date_day: number
}
