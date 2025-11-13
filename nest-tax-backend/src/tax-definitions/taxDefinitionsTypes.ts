import { TaxType } from '@prisma/client'

import { NorisRealEstateTax } from '../noris/types/noris.types'

import {
  GetTaxDetailPureOptions,
  GetTaxDetailPureResponse,
} from '../tax/utils/types'
import { RealEstateTaxDetail } from '../prisma/json-types'

export type TaxDefinition = {
  /** Type of tax (DZN, KO, ...) */
  type: TaxType

  /** Whether this tax type is unique per taxpayer and year */
  isUnique: boolean

  numberOfInstallments: number,

  /** Threshold for allowing installment payments (splátková hranica) in eurocents */
  paymentCalendarThreshold: number

  /** Maps Noris tax data into detailed tax items. */
  mapNorisToTaxDetailData: (
    data: NorisRealEstateTax,
  ) => RealEstateTaxDetail

  /** Returns tax detail in a pure format (used to calculate installments payments). */
  getTaxDetailPure: (
    options: GetTaxDetailPureOptions,
  ) => GetTaxDetailPureResponse
}

export type TaxDefinitionsMap = Record<TaxType, TaxDefinition>
