import { TaxType } from '@prisma/client'

import { mapNorisToRealEstateDatabaseDetail } from '../noris/utils/mapping.helper'
import { generateItemizedRealEstateTaxDetail } from '../tax/utils/helpers/tax.helper'
import { TaxDefinitionsMap } from './taxDefinitionsTypes'
import { createTestingCommunalWasteTaxMock, createTestingRealEstateTaxMock } from '../admin/utils/testing-tax-mock'

export const taxDefinitions: TaxDefinitionsMap = {
  [TaxType.DZN]: {
    type: TaxType.DZN,
    isUnique: true,
    numberOfInstallments: 3,
    paymentCalendarThreshold: 6600,
    mapNorisToTaxDetailData: mapNorisToRealEstateDatabaseDetail,
    generateItemizedTaxDetail: generateItemizedRealEstateTaxDetail,
    createTestingTaxMock: createTestingRealEstateTaxMock,
  },
  [TaxType.KO]: {
    type: TaxType.KO,
    isUnique: false,
    numberOfInstallments: 4,
    paymentCalendarThreshold: 0,
    mapNorisToTaxDetailData: () => {
      throw new Error('Not implemented')
    },
    generateItemizedTaxDetail: () => {
      throw new Error('Not implemented')
    },
    createTestingTaxMock: createTestingCommunalWasteTaxMock,
  },
}
