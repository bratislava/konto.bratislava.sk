import { TaxGetPayload, TaxPaymentGetPayload, TaxSelect } from "../../../prisma/generated/prisma/models"

export type TaxPaymentWithTaxInfo<
  TTaxSelect extends TaxSelect = {
    year: true
    type: true
    order: true
  },
> = TaxPaymentGetPayload<{
  include: {
    tax: {
      select: TTaxSelect
    }
  }
}>

export type TaxPaymentWithTaxAndTaxPayer = TaxPaymentGetPayload<{
  include: {
    tax: {
      include: {
        taxPayer: true
      }
    }
  }
}>

export type TaxWithTaxPayer = TaxGetPayload<{
  include: {
    taxPayer: true
  }
}>
