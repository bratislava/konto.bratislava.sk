import { TaxType } from '@prisma/client'

import {
  mapNorisToCommunalWasteDatabaseDetail,
  mapNorisToRealEstateDatabaseDetail,
} from '../noris/utils/mapping.helper'
import {
  generateItemizedCommunalWasteTaxDetail,
  generateItemizedRealEstateTaxDetail,
} from '../tax/utils/helpers/tax.helper'
import {
  createTestingCommunalWasteTaxMock,
  createTestingRealEstateTaxMock,
} from '../tax/utils/testing-tax-mock'
import { TaxDefinitionsMap } from './taxDefinitionsTypes'

export const taxDefinitions: TaxDefinitionsMap = {
  [TaxType.DZN]: {
    type: TaxType.DZN,
    isUnique: true,
    numberOfInstallments: 3,
    paymentCalendarThreshold: 6600,
    mapNorisToTaxDetailData: mapNorisToRealEstateDatabaseDetail,
    generateItemizedTaxDetail: generateItemizedRealEstateTaxDetail,
    createTestingTaxMock: createTestingRealEstateTaxMock,
    lastUpdatedAtDatabaseFieldName: 'lastUpdatedAtDZN',
    iban: 'SK3175000000000025747653',
  },
  [TaxType.KO]: {
    type: TaxType.KO,
    isUnique: false,
    paymentCalendarThreshold: 0,
    mapNorisToTaxDetailData: mapNorisToCommunalWasteDatabaseDetail,
    generateItemizedTaxDetail: generateItemizedCommunalWasteTaxDetail,
    createTestingTaxMock: createTestingCommunalWasteTaxMock,
    lastUpdatedAtDatabaseFieldName: 'lastUpdatedAtKO',
    iban: 'SK3675000000000025927013',
  },
}
