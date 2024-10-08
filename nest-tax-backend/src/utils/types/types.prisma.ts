import { Prisma } from '@prisma/client'

export type TaxPaymentWithTaxYear = Prisma.TaxPaymentGetPayload<{
  include: {
    tax: {
      select: {
        year: true
      }
    }
  }
}>
