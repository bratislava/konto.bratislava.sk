import { TaxType } from '@prisma/client'

import { mapNorisToRealEstateDatabaseDetail } from '../noris/utils/mapping.helper'
import { getRealEstateTaxDetailPure } from '../tax/utils/unified-tax.util'
import { TaxDefinitionsMap } from './taxDefinitionsTypes'
import { generateItemizedRealEstateTaxDetail } from '../tax/utils/helpers/tax.helper'

export const taxDefinitions: TaxDefinitionsMap = {
  [TaxType.DZN]: {
    type: TaxType.DZN,
    isUnique: true,
    numberOfInstallments: 3,
    paymentCalendarThreshold: 6600,
    mapNorisToTaxDetailData: mapNorisToRealEstateDatabaseDetail,
    getTaxDetailPure: getRealEstateTaxDetailPure,
    generateItemizedTaxDetail: generateItemizedRealEstateTaxDetail,
  },
  [TaxType.KO]: {
    type: TaxType.KO,
    isUnique: false,
    numberOfInstallments: 4,
    paymentCalendarThreshold: 0,
    mapNorisToTaxDetailData: () => {
      throw new Error('Not implemented')
    },
    getTaxDetailPure: () => {
      throw new Error('Not implemented')
    },
    generateItemizedTaxDetail: () => {
      throw new Error('Not implemented')
    },
  },
}
