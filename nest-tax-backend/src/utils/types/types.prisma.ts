import { Prisma } from '@prisma/client'

export type TaxPaymentWithTaxInfo<
  TTaxSelect extends Prisma.TaxSelect = {
    year: true
    type: true
    order: true
  },
> = Prisma.TaxPaymentGetPayload<{
  include: {
    tax: {
      select: TTaxSelect
    }
  }
}>

export type TaxPaymentWithTaxAndTaxPayer = Prisma.TaxPaymentGetPayload<{
  include: {
    tax: {
      include: {
        taxPayer: true
      }
    }
  }
}>

export type TaxWithTaxPayer = Prisma.TaxGetPayload<{
  include: {
    taxPayer: true
  }
}>
