import { TaxType } from '@prisma/client'

import { NorisTaxPayersDto } from '../noris/noris.dto'
import {
  RealEstateTaxData,
  RealEstateTaxDetail,
} from '../noris/utils/mapping.helper'
import {
  realEstateTaxDetailsToPdf,
  realEstateTaxTotalsToPdf,
} from '../tax/utils/helpers/pdf.helper'
import {
  GetTaxDetailPureOptions,
  GetTaxDetailPureResponse,
} from '../tax/utils/types'

export type TaxDefinition = {
  type: TaxType
  isUnique: boolean
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
  getTaxDetailPure: (
    options: GetTaxDetailPureOptions,
  ) => GetTaxDetailPureResponse

  pdfOptions:
    | {
        generate: false
      }
    | {
        generate: true
        taxDetailsToPdf: typeof realEstateTaxDetailsToPdf
        taxTotalsToPdf: typeof realEstateTaxTotalsToPdf
      }
}
