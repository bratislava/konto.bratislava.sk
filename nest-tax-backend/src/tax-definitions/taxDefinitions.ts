import { TaxType } from '@prisma/client'

import {
  mapNorisToRealEstateTaxData,
  mapNorisToRealEstateTaxDetailData,
} from '../noris/utils/mapping.helper'
import {
  realEstateTaxDetailsToPdf,
  realEstateTaxTotalsToPdf,
} from '../tax/utils/helpers/pdf.helper'
import { getRealEstateTaxDetailPure } from '../tax/utils/unified-tax.util'
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
    getTaxDetail: 'getRealEstateTaxDetail',
    getTaxDetailPure: getRealEstateTaxDetailPure,
    pdfOptions: {
      generate: true,
      taxDetailsToPdf: realEstateTaxDetailsToPdf,
      taxTotalsToPdf: realEstateTaxTotalsToPdf,
    },
  },
]

// Done modules - Admin, Auth, Bloomreach, CardPaymentReporting, Clients, Noris, Payment, Tasks, Tax
