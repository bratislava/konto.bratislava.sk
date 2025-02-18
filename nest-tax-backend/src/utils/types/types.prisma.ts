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

export type TaxIdVariableSymbol = Prisma.TaxGetPayload<{
  select: {
    id: true
    variableSymbol: true
  }
}>
