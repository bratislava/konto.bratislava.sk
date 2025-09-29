import { TaxType } from '@prisma/client'

import {
  mapNorisToRealEstateTaxData,
  mapNorisToRealEstateTaxDetailData,
} from '../noris/utils/mapping.helper'
import { TaxDefinition } from './taxDefinitionsTypes'

export const taxDefinitions: TaxDefinition[] = [
  {
    type: TaxType.DZN,
    getAndProcessDataFromNoris:
      'getAndProcessNewNorisRealEstateTaxDataByBirthNumberAndYear',
    getDataFromNorisAndUpdateExistingRecords:
      'getNorisRealEstateTaxDataByBirthNumberAndYearAndUpdateExistingRecords',
    mapNorisToTaxData: mapNorisToRealEstateTaxData,
    mapNorisToTaxDetailData: mapNorisToRealEstateTaxDetailData,
    getDataForUpdate: 'getRealEstateDataForUpdate',
  },
]

// Done modules - Admin, Auth, Bloomreach, CardPaymentReporting, Clients, Noris
