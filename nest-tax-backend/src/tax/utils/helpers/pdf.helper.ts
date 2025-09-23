import {
  Tax,
  TaxDetail,
  TaxDetailareaType,
  TaxDetailType,
  TaxInstallment,
} from '@prisma/client'
import currency from 'currency.js'

import { TaxTotalsToPdfDto } from '../../dtos/response.pdf.dto'

type TaxDetailsToPdfResponse = {
  [typeKey in TaxDetailType]?: {
    [areaKey in TaxDetailareaType]?: {
      area: string | null
      base: string
      amount: string
    }
  }
}

export const taxDetailsToPdf = (taxDetails: TaxDetail[]) => {
  const response: TaxDetailsToPdfResponse = {}
  taxDetails.forEach((taxDetail) => {
    if (!(taxDetail.type in response)) {
      response[taxDetail.type] = {}
    }
    response[taxDetail.type]![taxDetail.areaType] = {
      area: taxDetail.area,
      base: currency(taxDetail.base, { fromCents: true })
        .toString()
        .replace('.', ','),
      amount: currency(taxDetail.amount, { fromCents: true })
        .toString()
        .replace('.', ','),
    }
  })
  return response
}

export const taxTotalsToPdf = (
  tax: Tax,
  taxInstallments: TaxInstallment[],
): TaxTotalsToPdfDto => {
  const total: TaxTotalsToPdfDto = {
    total: currency(tax.amount, { fromCents: true })
      .toString()
      .replace('.', ','),
    taxFlat: currency(tax.taxFlat ?? 0, { fromCents: true })
      .toString()
      .replace('.', ','),
    taxConstructions: currency(tax.taxConstructions ?? 0, { fromCents: true })
      .toString()
      .replace('.', ','),
    taxLand: currency(tax.taxLand ?? 0, { fromCents: true })
      .toString()
      .replace('.', ','),
    taxInstallments: [],
  }
  taxInstallments.forEach((taxInstallment) => {
    total.taxInstallments.push({
      text: taxInstallment.text,
      amount: currency(taxInstallment.amount, { fromCents: true })
        .toString()
        .replace('.', ','),
    })
  })
  return total
}
