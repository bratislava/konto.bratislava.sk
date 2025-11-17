import { TaxType } from '@prisma/client'

import {
  NorisCommunalWasteTax,
  NorisRealEstateTax,
} from '../noris/types/noris.types'

import {
  GetTaxDetailPureOptions,
  GetTaxDetailPureResponse,
} from '../tax/utils/types'
import {
  CommunalWasteTaxDetail,
  RealEstateTaxDetail,
} from '../prisma/json-types'
import {
  ResponseCommunalWasteTaxDetailItemizedDto,
  ResponseCommunalWasteTaxSummaryDetailDto,
  ResponseRealEstateTaxDetailItemizedDto,
  ResponseRealEstateTaxSummaryDetailDto,
} from '../tax/dtos/response.tax.dto'
import { generateItemizedRealEstateTaxDetail } from '../tax/utils/helpers/tax.helper'
import { NorisTaxRealEstateSubservice } from '../noris/subservices/noris-tax/noris-tax.real-estate.subservice'
import { NorisTaxCommunalWasteSubservice } from '../noris/subservices/noris-tax/noris-tax.communal-waste.subservice'

// Central type mapping - single source of truth
export type TaxTypeToNorisData = {
  [TaxType.DZN]: NorisRealEstateTax
  [TaxType.KO]: NorisCommunalWasteTax
}

export type TaxTypeToTaxDetail = {
  [TaxType.DZN]: RealEstateTaxDetail
  [TaxType.KO]: CommunalWasteTaxDetail
}

export type TaxTypeToResponseDetailItemizedDto = {
  [TaxType.DZN]: ResponseRealEstateTaxDetailItemizedDto
  [TaxType.KO]: ResponseCommunalWasteTaxDetailItemizedDto
}

export type TaxTypeToResponseRealEstateTaxDetailDto = {
  [TaxType.DZN]: ResponseRealEstateTaxSummaryDetailDto
  [TaxType.KO]: ResponseCommunalWasteTaxSummaryDetailDto
}

// Forward declaration for circular dependency
export interface AbstractNorisTaxSubservice<TTaxType extends TaxType> {
  processNorisTaxData(
    norisData: TaxTypeToNorisData[TTaxType][],
    year: number,
  ): Promise<string[]>
  getAndProcessNorisTaxDataByBirthNumberAndYear(
    year: number,
    birthNumbers: string[],
  ): Promise<any>
  getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    year: number,
    birthNumbers: string[],
  ): Promise<{ updated: number }>
}

export type TaxDefinition<TTaxType extends TaxType> = {
  /** Type of tax (DZN, KO, ...) */
  type: TTaxType

  /** Whether this tax type is unique per taxpayer and year */
  isUnique: boolean

  numberOfInstallments: number

  /** Threshold for allowing installment payments (splátková hranica) in eurocents */
  paymentCalendarThreshold: number

  /** Maps Noris tax data into detailed tax items. */
  mapNorisToTaxDetailData: (
    data: TaxTypeToNorisData[TTaxType],
  ) => TaxTypeToTaxDetail[TTaxType]

  /** Returns tax detail in a pure format (used to calculate installments payments). */
  getTaxDetailPure: (
    options: GetTaxDetailPureOptions<TTaxType>,
  ) => GetTaxDetailPureResponse<TTaxType>

  generateItemizedTaxDetail: (
    options: TaxTypeToTaxDetail[TTaxType]
  ) => TaxTypeToResponseDetailItemizedDto[TTaxType]

  /** Noris tax subservice instance for this tax type */
  norisSubservice?: AbstractNorisTaxSubservice<TTaxType>
}


export type TaxDefinitionsMap = { [K in TaxType]: TaxDefinition<K> }
