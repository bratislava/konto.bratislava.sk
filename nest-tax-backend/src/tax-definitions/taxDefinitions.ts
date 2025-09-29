import { TaxType } from '@prisma/client'

import { TaxDefinition } from './taxDefinitionsTypes'

export const taxDefinitions: TaxDefinition[] = [
  {
    type: TaxType.DZN,
    getAndProcessDataFromNoris:
      'getAndProcessNewNorisTaxDataByBirthNumberAndYear',
    getDataFromNorisAndUpdateExistingRecords:
      'getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords',
  },
]

// Done modules - Admin
