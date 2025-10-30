import { TaxDetail, TaxDetailType } from '@prisma/client'
import dayjs, { Dayjs } from 'dayjs'

import { TaxPaidStatusEnum, TaxStatusEnum } from '../../dtos/response.tax.dto'

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

export const getExistingTaxStatus = (
  taxAmount: number,
  paidAmount: number,
): TaxStatusEnum => {
  if (paidAmount === 0) {
    return TaxStatusEnum.NOT_PAID
  }

  if (paidAmount === taxAmount) {
    return TaxStatusEnum.PAID
  }

  if (paidAmount > taxAmount) {
    return TaxStatusEnum.OVER_PAID
  }

  return TaxStatusEnum.PARTIALLY_PAID
}
export const checkTaxDateInclusion = (
  currentTime: Dayjs,
  lookingForTaxDate: {
    from: { month: number; day: number }
    to: { month: number; day: number }
  },
) => {
  const displayFrom = dayjs.tz(
    `${currentTime.year()}-${lookingForTaxDate.from.month}-${lookingForTaxDate.from.day}`,
    'Europe/Bratislava',
  )
  const displayTo = dayjs.tz(
    `${currentTime.year()}-${lookingForTaxDate.to.month}-${lookingForTaxDate.to.day}`,
    'Europe/Bratislava',
  )
  return currentTime.isAfter(displayFrom) && currentTime.isBefore(displayTo)
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
        type: detail.areaType,
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
