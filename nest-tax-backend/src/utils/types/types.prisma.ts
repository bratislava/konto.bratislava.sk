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

export type TaxWithTaxPayer = Prisma.TaxGetPayload<{
  include: {
    taxPayer: true
  }
}>

export type TaxIdVariableSymbolYear = Prisma.TaxGetPayload<{
  select: {
    id: true
    variableSymbol: true
    year: true
  }
}>
