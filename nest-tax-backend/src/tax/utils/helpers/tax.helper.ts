import {
  ResponseTaxDetailItemizedDto,
  TaxPaidStatusEnum,
} from '../../dtos/response.tax.dto'
import {
  TaxDetail,
  TaxDetailareaType,
  TaxDetailType,
  TaxInstallment,
} from '@prisma/client'

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

export const generateItemizedTaxDetail = (
  taxDetails: TaxDetail[],
): ResponseTaxDetailItemizedDto => {
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
        area: detail.area,
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

  const apartmentTotalAmount = apartmentTaxDetail.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  )
  const groundTotalAmount = groundTaxDetail.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  )
  const constructionTotalAmount = constructionTaxDetail.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  )
  return {
    apartmentTotalAmount,
    groundTotalAmount,
    constructionTotalAmount,
    apartmentTaxDetail,
    groundTaxDetail,
    constructionTaxDetail,
  }
}
