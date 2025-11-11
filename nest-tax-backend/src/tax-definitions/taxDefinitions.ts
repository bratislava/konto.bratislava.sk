import { TaxType } from '@prisma/client'

import {
  mapNorisToRealEstateTaxData,
  mapNorisToRealEstateTaxDetailData,
} from '../noris/utils/mapping.helper'
import { getRealEstateTaxDetailPure } from '../tax/utils/unified-tax.util'
import { TaxDefinitionsMap } from './taxDefinitionsTypes'

export const taxDefinitions: TaxDefinitionsMap = {
  [TaxType.DZN]: {
    type: TaxType.DZN,
    isUnique: true,
    numberOfInstallments: 3,
    paymentCalendarThreshold: 6600,
    mapNorisToTaxData: mapNorisToRealEstateTaxData,
    mapNorisToTaxDetailData: mapNorisToRealEstateTaxDetailData,
    getTaxDetailPure: getRealEstateTaxDetailPure,
  },
  [TaxType.KO]: {
    type: TaxType.KO,
    isUnique: false,
    numberOfInstallments: 4,
    paymentCalendarThreshold: 0,
    mapNorisToTaxData: () => {
      throw new Error('Not implemented')
    },
    mapNorisToTaxDetailData: () => {
      throw new Error('Not implemented')
    },
    getTaxDetailPure: () => {
      throw new Error('Not implemented')
    },
  },
}
