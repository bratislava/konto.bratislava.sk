import {
  TaxDetail,
  TaxDetailareaType,
  TaxDetailType,
  TaxInstallment,
} from '@prisma/client'

import { TaxPaidStatusEnum } from '../../dtos/response.tax.dto'

export const getTaxStatus = (
  desiredPayment: number,
  alreadyPaid: number | undefined,
): TaxPaidStatusEnum => {
  if (!alreadyPaid) return TaxPaidStatusEnum.NOT_PAID
  if (alreadyPaid === 0) return TaxPaidStatusEnum.NOT_PAID
  if (alreadyPaid > desiredPayment) return TaxPaidStatusEnum.OVER_PAID
  if (alreadyPaid === desiredPayment) return TaxPaidStatusEnum.PAID
  return TaxPaidStatusEnum.PARTIALLY_PAID
}

export const fixInstallmentTexts = (
  taxInstallments: TaxInstallment[],
  year: number,
): TaxInstallment[] => {
  return taxInstallments.map((taxInstallment, i) => {
    if (i === 1) {
      return {
        ...taxInstallment,
        text: `- druhá splátka v termíne do 31.08.${year} v sume:`,
      }
    }
    if (i === 2) {
      return {
        ...taxInstallment,
        text: `- tretia splátka v termíne do 31.10.${year} v sume:`,
      }
    }
    return taxInstallment
  })
}

export const generateItemizedTaxDetail = (taxDetails: TaxDetail[]) => {
  const apartmentTaxDetail = taxDetails
    .filter((detail) => detail.type === TaxDetailType.APARTMENT)
    .map((detail) => {
      return {
        type: detail.areaType,
        base: detail.base,
        amount: detail.amount,
      }
    })
  const groundTaxDetail = taxDetails
    .filter((detail) => detail.type === TaxDetailType.GROUND)
    .map((detail) => {
      return {
        type: detail.areaType as TaxDetailareaType,
        area: detail.area ?? undefined,
        base: detail.base,
        amount: detail.amount,
      }
    })
  const constructionTaxDetail = taxDetails
    .filter((detail) => detail.type === TaxDetailType.CONSTRUCTION)
    .map((detail) => {
      return {
        type: detail.areaType,
        base: detail.base,
        amount: detail.amount,
      }
    })
  return {
    apartmentTaxDetail,
    groundTaxDetail,
    constructionTaxDetail,
  }
}
