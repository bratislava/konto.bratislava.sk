import {
  Tax,
  TaxDetail,
  TaxDetailareaType,
  TaxDetailType,
  TaxInstallment,
} from '@prisma/client'
import currency from 'currency.js'

import { RealEstateTaxTotalsToPdfDto } from '../../dtos/response.pdf.dto'

type TaxDetailsToPdfResponse = {
  [typeKey in TaxDetailType]?: {
    [areaKey in TaxDetailareaType]?: {
      area: string | null
      base: string
      amount: string
    }
  }
}

export const realEstateTaxDetailsToPdf = (taxDetails: TaxDetail[]) => {
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

export const realEstateTaxTotalsToPdf = (
  tax: Tax,
  taxInstallments: TaxInstallment[],
): RealEstateTaxTotalsToPdfDto => {
  const total: RealEstateTaxTotalsToPdfDto = {
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
