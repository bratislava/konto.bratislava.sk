import { TaxType } from '@prisma/client'

import { NorisRealEstateTax } from '../noris/types/noris.types'
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

  /** Maps Noris tax data into format supported by our database. */
  mapNorisToTaxData: (
    data: NorisRealEstateTax,
    year: number,
    taxPayerId: number,
  ) => RealEstateTaxData

  /** Threshold for allowing installment payments (splátková hranica) in eurocents */
  paymentCalendarThreshold: number

  /** Maps Noris tax data into detailed tax items. */
  mapNorisToTaxDetailData: (
    data: NorisRealEstateTax,
    taxId: number,
  ) => RealEstateTaxDetail[]

  /** Returns tax detail in a pure format (used to calculate installments payments). */
  getTaxDetailPure: (
    options: GetTaxDetailPureOptions,
  ) => GetTaxDetailPureResponse
}

export type TaxDefinitionsMap = Record<TaxType, TaxDefinition>
