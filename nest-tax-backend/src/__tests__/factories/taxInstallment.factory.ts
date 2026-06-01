import { Prisma, UnpaidReminderSent } from '@prisma/client'

import { createTestTax } from './tax.factory'

export const createTestTaxInstallment = (
  overrides?: Partial<
    Prisma.TaxInstallmentGetPayload<{ include: { tax: true } }>
  >,
): Prisma.TaxInstallmentGetPayload<{ include: { tax: true } }> => {
  const DEFAULT_DATE = new Date('2024-01-01T00:00:00.000Z')
  return {
    id: 1,
    taxId: 1,
    order: 1,
    amount: 1000,
    dueDate: DEFAULT_DATE,
    bloomreachUnpaidReminderSent: UnpaidReminderSent.NONE,
    tax: createTestTax(),
    createdAt: DEFAULT_DATE,
    updatedAt: DEFAULT_DATE,
    ...overrides,
  }
}
