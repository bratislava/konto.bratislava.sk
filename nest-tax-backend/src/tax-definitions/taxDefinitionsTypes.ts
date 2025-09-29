import { TaxType } from '@prisma/client'

import { NorisTaxPayersDto } from '../noris/noris.dto'
import {
  RealEstateTaxData,
  RealEstateTaxDetail,
} from '../noris/utils/mapping.helper'

export type TaxDefinition = {
  type: TaxType
  getAndProcessDataFromNoris: 'getAndProcessNewNorisRealEstateTaxDataByBirthNumberAndYear'
  getDataFromNorisAndUpdateExistingRecords: 'getNorisRealEstateTaxDataByBirthNumberAndYearAndUpdateExistingRecords'
  mapNorisToTaxData: (
    data: NorisTaxPayersDto,
    year: number,
    taxPayerId: number,
    qrCodeEmail: string,
    qrCodeWeb: string,
  ) => RealEstateTaxData
  mapNorisToTaxDetailData: (
    data: NorisTaxPayersDto,
    taxId: number,
  ) => RealEstateTaxDetail[]
  getDataForUpdate: 'getRealEstateDataForUpdate'
}
