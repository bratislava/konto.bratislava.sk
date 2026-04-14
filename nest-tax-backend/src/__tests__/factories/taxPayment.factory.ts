import { PaymentStatus, TaxPaymentSource } from '@prisma/client'

import {
  TaxPaymentWithTaxAndTaxPayer,
  TaxWithTaxPayer,
} from '../../utils/types/types.prisma'
import { createTestTax, type TestTaxOverrides } from './tax.factory'

const DEFAULT_DATE = new Date('2024-01-01T00:00:00.000Z')

type TestTaxPaymentOverrides = Partial<
  Omit<TaxPaymentWithTaxAndTaxPayer, 'tax'>
> & {
  tax?: TestTaxOverrides
}

export const createTestTaxPayment = (
  overrides?: TestTaxPaymentOverrides,
): TaxPaymentWithTaxAndTaxPayer => {
  const { tax: taxOverrides, ...restPaymentOverrides } = overrides ?? {}

  const baseTax = createTestTax()
  const mergedTax: TaxWithTaxPayer = {
    ...baseTax,
    ...taxOverrides,
    taxPayer: {
      ...baseTax.taxPayer,
      ...taxOverrides?.taxPayer,
    },
  } as TaxWithTaxPayer

  return {
    id: 1,
    orderId: '1234567890',
    createdAt: DEFAULT_DATE,
    updatedAt: DEFAULT_DATE,
    status: PaymentStatus.NEW,
    amount: 1000,
    source: TaxPaymentSource.CARD,
    bloomreachEventSent: true,
    ...restPaymentOverrides,
    taxId: restPaymentOverrides.taxId ?? mergedTax.id,
    tax: mergedTax,
  }
}
