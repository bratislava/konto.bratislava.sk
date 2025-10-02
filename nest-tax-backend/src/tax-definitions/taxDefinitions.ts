import { TaxType } from '@prisma/client'

import {
  mapNorisToRealEstateTaxData,
  mapNorisToRealEstateTaxDetailData,
} from '../noris/utils/mapping.helper'
import { RealEstatePdfHelper } from '../tax/utils/helpers/pdf.helper'
import { getRealEstateTaxDetailPure } from '../tax/utils/unified-tax.util'
import { TaxDefinition } from './taxDefinitionsTypes'

export const taxDefinitions: TaxDefinition[] = [
  {
    type: TaxType.DZN,
    isUnique: true,
    mapNorisToTaxData: mapNorisToRealEstateTaxData,
    mapNorisToTaxDetailData: mapNorisToRealEstateTaxDetailData,
    getTaxDetailPure: getRealEstateTaxDetailPure,
    pdfOptions: {
      generate: true,
      pdfHelper: RealEstatePdfHelper,
    },
  },
]
