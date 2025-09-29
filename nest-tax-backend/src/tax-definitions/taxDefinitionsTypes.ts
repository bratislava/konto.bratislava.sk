import { TaxType } from '@prisma/client'

export type TaxDefinition = {
  type: TaxType
  getAndProcessDataFromNoris: 'getAndProcessNewNorisTaxDataByBirthNumberAndYear'
  getDataFromNorisAndUpdateExistingRecords: 'getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords'
}
