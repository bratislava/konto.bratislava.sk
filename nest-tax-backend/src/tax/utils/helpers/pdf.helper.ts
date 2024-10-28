// TODO
/* eslint-disable no-restricted-syntax */
import { Tax, TaxDetail, TaxDetailareaType, TaxDetailType, TaxInstallment } from '@prisma/client'
import currency from 'currency.js'

export const taxDetailsToPdf = (taxDetails: TaxDetail[]) => {
  const response: Record<TaxDetailType, Record<TaxDetailareaType, {area: string | null, base: string, amount: string}>> = {}
  for (const taxDetail of taxDetails) {
    if (taxDetail.type in response === false) {
      response[taxDetail.type] = {}
    }
    if (taxDetail.areaType in response[taxDetail.type] === false) {
      response[taxDetail.type][taxDetail.areaType] = {}
    }
    response[taxDetail.type][taxDetail.areaType] = {
      area: taxDetail.area,
      base: currency(taxDetail.base, { fromCents: true })
        .toString()
        .replace('.', ','),
      amount: currency(taxDetail.amount, { fromCents: true })
        .toString()
        .replace('.', ','),
    }
  }
  return response
}

export const taxTotalsToPdf = (tax: Tax, taxInstallments: TaxInstallment[]) => {
  const total = {
    total: currency(tax.amount, { fromCents: true })
      .toString()
      .replace('.', ','),
    taxFlat: currency(tax.taxFlat, { fromCents: true })
      .toString()
      .replace('.', ','),
    taxConstructions: currency(tax.taxConstructions, { fromCents: true })
      .toString()
      .replace('.', ','),
    taxLand: currency(tax.taxLand, { fromCents: true })
      .toString()
      .replace('.', ','),
    taxInstallments: [],
  }
  for (const taxInstallment of taxInstallments) {
    total.taxInstallments.push({
      text: taxInstallment.text,
      amount: currency(taxInstallment.amount, { fromCents: true })
        .toString()
        .replace('.', ','),
    })
  }
  return total
}
