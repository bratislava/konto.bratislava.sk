import dayjs, { Dayjs } from 'dayjs'

import {
  CommunalWasteTaxDetail,
  RealEstateTaxDetail,
  RealEstateTaxPropertyType,
} from '../../../prisma/json-types'
import {
  ResponseCommunalWasteTaxDetailItemizedDto,
  ResponseRealEstateTaxDetailItemizedDto,
  TaxStatusEnum,
} from '../../dtos/response.tax.dto'

export const getExistingTaxStatus = (
  taxAmount: number,
  paidAmount: number,
  isCancelled: boolean,
): TaxStatusEnum => {
  if (isCancelled) {
    return TaxStatusEnum.CANCELLED
  }

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

export const generateItemizedRealEstateTaxDetail = (
  taxDetails: RealEstateTaxDetail,
): ResponseRealEstateTaxDetailItemizedDto => {
  const apartmentTaxDetail = taxDetails.propertyDetails
    .filter((detail) => detail.type === RealEstateTaxPropertyType.APARTMENT)
    .map((detail) => {
      return {
        type: detail.areaType,
        base: detail.base,
        amount: detail.amount,
      }
    })
  const groundTaxDetail = taxDetails.propertyDetails
    .filter((detail) => detail.type === RealEstateTaxPropertyType.GROUND)
    .map((detail) => {
      return {
        type: detail.areaType,
        area: detail.area ?? undefined,
        base: detail.base,
        amount: detail.amount,
      }
    })
  const constructionTaxDetail = taxDetails.propertyDetails
    .filter((detail) => detail.type === RealEstateTaxPropertyType.CONSTRUCTION)
    .map((detail) => {
      return {
        type: detail.areaType,
        base: detail.base,
        amount: detail.amount,
      }
    })
  return {
    apartmentTotalAmount: taxDetails.taxFlat,
    constructionTotalAmount: taxDetails.taxConstructions,
    groundTotalAmount: taxDetails.taxLand,
    apartmentTaxDetail,
    groundTaxDetail,
    constructionTaxDetail,
  }
}

export const generateItemizedCommunalWasteTaxDetail = (
  taxDetails: CommunalWasteTaxDetail,
): ResponseCommunalWasteTaxDetailItemizedDto => {
  const addressDetail = taxDetails.addresses.map((address) => {
    // Calculate total amount for this address (sum of all poplatok)
    const totalAmount = address.containers.reduce(
      (sum, detail) => sum + detail.poplatok,
      0,
    )

    // Map details to itemized containers
    const itemizedContainers = address.containers.map((container) => ({
      containerVolume: container.objem_nadoby,
      containerCount: container.pocet_nadob,
      numberOfDisposals: container.pocet_odvozov,
      unitRate: container.sadzba,
      containerType: container.druh_nadoby,
      fee: container.poplatok,
    }))

    return {
      address: {
        street: address.addressDetail.street ?? '',
        orientationNumber: address.addressDetail.orientationNumber ?? '',
      },
      totalAmount,
      itemizedContainers,
    }
  })

  return {
    addressDetail,
  }
}
