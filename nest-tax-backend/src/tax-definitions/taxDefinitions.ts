import { TaxType } from '@prisma/client'

import { TaxDefinition } from './taxDefinitionsTypes'

export const taxDefinitions: TaxDefinition[] = [
  {
    type: TaxType.DZN,
    getAndProcessDataFromNoris:
      'getAndProcessNewNorisRealEstateTaxDataByBirthNumberAndYear',
    getDataFromNorisAndUpdateExistingRecords:
      'getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords',
  },
]

// Done modules - Admin, Auth, Bloomreach
