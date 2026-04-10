import { PaymentStatus, TaxPaymentSource } from '@prisma/client'

import {
  TaxPaymentWithTaxAndTaxPayer,
  TaxWithTaxPayer,
} from '../../utils/types/types.prisma'
import { createTestTax, type TestTaxOverrides } from './tax.factory'

type TaxPaymentTestOverrides = Partial<
  Omit<TaxPaymentWithTaxAndTaxPayer, 'tax'>
> & {
  tax?: TestTaxOverrides
}

export const createTestTaxPayment = (
  overrides?: TaxPaymentTestOverrides,
): TaxPaymentWithTaxAndTaxPayer => {
  const baseTax = createTestTax()
  const mergedTax: TaxWithTaxPayer = {
    ...baseTax,
    ...overrides?.tax,
    taxPayer: {
      ...baseTax.taxPayer,
      ...overrides?.tax?.taxPayer,
    },
  }

  // Nested `tax` is merged into `mergedTax` above.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omit `tax` from spread source
  const { tax, ...restPaymentOverrides } = overrides ?? {}

  return {
    id: 1,
    orderId: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: PaymentStatus.NEW,
    amount: 1000,
    source: TaxPaymentSource.CARD,
    bloomreachEventSent: true,
    ...restPaymentOverrides,
    taxId: restPaymentOverrides.taxId ?? mergedTax.id,
    tax: mergedTax,
  }
}
