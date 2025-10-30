import {
  Tax,
  TaxDetail,
  TaxDetailareaType,
  TaxDetailType,
  TaxInstallment,
} from '@prisma/client'
import currency from 'currency.js'

import { RealEstateTaxTotalsToPdf } from '../../dtos/response.pdf.dto'

type RealEstateTaxDetailsToPdfResponse = {
  [typeKey in TaxDetailType]?: {
    [areaKey in TaxDetailareaType]?: {
      area: string | null
      base: string
      amount: string
    }
  }
}

export interface PdfHelper<
  TTaxDetail,
  TTaxDetailsToPdfResponse,
  TTaxTotalsToPdfResponse,
> {
  taxDetailsToPdf: (taxDetails: TTaxDetail[]) => TTaxDetailsToPdfResponse
  taxTotalsToPdf: (
    tax: Tax,
    taxInstallments: TaxInstallment[],
  ) => TTaxTotalsToPdfResponse
}

const formatAmountForPdf = (amount: number) => {
  return currency(amount, { fromCents: true }).toString().replace('.', ',')
}

export const RealEstatePdfHelper: PdfHelper<
  TaxDetail,
  RealEstateTaxDetailsToPdfResponse,
  RealEstateTaxTotalsToPdf
> = {
  taxDetailsToPdf: (taxDetails: TaxDetail[]) => {
    const response: RealEstateTaxDetailsToPdfResponse = {}
    taxDetails.forEach((taxDetail) => {
      if (!(taxDetail.type in response)) {
        response[taxDetail.type] = {}
      }
      response[taxDetail.type]![taxDetail.areaType] = {
        area: taxDetail.area,
        base: formatAmountForPdf(taxDetail.base),
        amount: formatAmountForPdf(taxDetail.amount),
      }
    })
    return response
  },

  taxTotalsToPdf: (
    tax: Tax,
    taxInstallments: TaxInstallment[],
  ): RealEstateTaxTotalsToPdf => {
    const total: RealEstateTaxTotalsToPdf = {
      total: formatAmountForPdf(tax.amount),
      taxFlat: formatAmountForPdf(tax.taxFlat ?? 0),
      taxConstructions: formatAmountForPdf(tax.taxConstructions ?? 0),
      taxLand: formatAmountForPdf(tax.taxLand ?? 0),
      taxInstallments: [],
    }
    taxInstallments.forEach((taxInstallment) => {
      total.taxInstallments.push({
        text: taxInstallment.text,
        amount: formatAmountForPdf(taxInstallment.amount),
      })
    })
    return total
  },
}

export type PdfHelperImplemented = PdfHelper<
  TaxDetail,
  RealEstateTaxDetailsToPdfResponse,
  RealEstateTaxTotalsToPdf
> /* | Other PDF helpers */
