import {
  CommunalWasteTaxDetail,
  RealEstateTaxDetail,
  RealEstateTaxPropertyType,
} from '../../../prisma/json-types'
import {
  BRATISLAVA_TIME_ZONE,
  isAfter,
  isBefore,
} from '../../../utils/functions/temporal'
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
  currentTime: Temporal.ZonedDateTime,
  lookingForTaxDate: {
    from: { month: number; day: number }
    to: { month: number; day: number }
  },
) => {
  const { year } = currentTime
  const displayFrom = Temporal.ZonedDateTime.from({
    timeZone: BRATISLAVA_TIME_ZONE,
    year,
    ...lookingForTaxDate.from,
  })
  const displayTo = Temporal.ZonedDateTime.from({
    timeZone: BRATISLAVA_TIME_ZONE,
    year,
    ...lookingForTaxDate.to,
  })
  return isAfter(currentTime, displayFrom) && isBefore(currentTime, displayTo)
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
