import { TaxType } from '@prisma/client'

import { NorisTaxPayersDto } from '../noris/noris.dto'
import {
  RealEstateTaxData,
  RealEstateTaxDetail,
} from '../noris/utils/mapping.helper'
import { PdfHelper } from '../tax/utils/helpers/pdf.helper'
import {
  GetTaxDetailPureOptions,
  GetTaxDetailPureResponse,
} from '../tax/utils/types'

export type TaxDefinition = {
  /** Type of tax (DZN, KO, ...) */
  type: TaxType

  /** Whether this tax type is unique per taxpayer and year */
  isUnique: boolean

  /** Maps Noris taxp data into format supported by our database. */
  mapNorisToTaxData: (
    data: NorisTaxPayersDto,
    year: number,
    taxPayerId: number,
    qrCodeEmail: string,
    qrCodeWeb: string,
  ) => RealEstateTaxData

  /** Maps Noris tax data into detailed tax items. */
  mapNorisToTaxDetailData: (
    data: NorisTaxPayersDto,
    taxId: number,
  ) => RealEstateTaxDetail[]

  /** Returns tax detail in a pure format (used to calculate installments payments). */
  getTaxDetailPure: (
    options: GetTaxDetailPureOptions,
  ) => GetTaxDetailPureResponse

  /** Configuration for PDF generation */
  pdfOptions: { generate: false } | { generate: true; pdfHelper: PdfHelper }
}

export type TaxDefinitionsMap = Record<TaxType, TaxDefinition>
