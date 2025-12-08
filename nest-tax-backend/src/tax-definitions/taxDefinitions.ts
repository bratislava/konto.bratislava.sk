import { TaxType } from '@prisma/client'

import {
  createTestingCommunalWasteTaxMock,
  createTestingRealEstateTaxMock,
} from '../admin/utils/testing-tax-mock'
import {
  mapNorisToCommunalWasteDatabaseDetail,
  mapNorisToRealEstateDatabaseDetail,
} from '../noris/utils/mapping.helper'
import {
  generateItemizedCommunalWasteTaxDetail,
  generateItemizedRealEstateTaxDetail,
} from '../tax/utils/helpers/tax.helper'
import { TaxDefinitionsMap } from './taxDefinitionsTypes'

export const taxDefinitions: TaxDefinitionsMap = {
  [TaxType.DZN]: {
    type: TaxType.DZN,
    isUnique: true,
    numberOfInstallments: 3,
    installmentDueDates: {
      second: '09-01',
      third: '11-01',
    },
    paymentCalendarThreshold: 6600,
    mapNorisToTaxDetailData: mapNorisToRealEstateDatabaseDetail,
    generateItemizedTaxDetail: generateItemizedRealEstateTaxDetail,
    createTestingTaxMock: createTestingRealEstateTaxMock,
    readyToImportFieldName: 'readyToImportDZN',
  },
  [TaxType.KO]: {
    type: TaxType.KO,
    isUnique: false,
    numberOfInstallments: 4,
    installmentDueDates: {
      second: '05-31',
      third: '08-31',
      fourth: '10-31',
    },
    paymentCalendarThreshold: 0,
    mapNorisToTaxDetailData: mapNorisToCommunalWasteDatabaseDetail,
    generateItemizedTaxDetail: generateItemizedCommunalWasteTaxDetail,
    createTestingTaxMock: createTestingCommunalWasteTaxMock,
    readyToImportFieldName: 'readyToImportKO',
  },
}
