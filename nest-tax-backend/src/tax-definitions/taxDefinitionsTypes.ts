import { TaxType } from '@prisma/client'

import { NorisTaxPayersDto } from '../noris/noris.dto'
import {
  RealEstateTaxData,
  RealEstateTaxDetail,
} from '../noris/utils/mapping.helper'
import {
  GetTaxDetailPureOptions,
  GetTaxDetailPureResponse,
} from '../tax/utils/types'

export type TaxDefinition = {
  /** Type of tax (DZN, KO, ...) */
  type: TaxType

  /** Whether this tax type is unique per taxpayer and year */
  isUnique: boolean

  /** Maps Noris taxp data into format supported by our database. */
  mapNorisToTaxData: (
    data: NorisTaxPayersDto,
    year: number,
    taxPayerId: number,
  ) => RealEstateTaxData

  /** Threshold for allowing installment payments (splátková hranica) in eurocents */
  paymentCalendarThreshold: number

  /** Maps Noris tax data into detailed tax items. */
  mapNorisToTaxDetailData: (
    data: NorisTaxPayersDto,
    taxId: number,
  ) => RealEstateTaxDetail[]

  /** Returns tax detail in a pure format (used to calculate installments payments). */
  getTaxDetailPure: (
    options: GetTaxDetailPureOptions,
  ) => GetTaxDetailPureResponse
}

export type TaxDefinitionsMap = Record<TaxType, TaxDefinition>
