import { PaymentStatus, TaxType } from '@prisma/client'

import {
  NorisCommunalWasteTax,
  NorisRealEstateTax,
} from '../noris/types/noris.types'
import {
  CommunalWasteTaxDetail,
  RealEstateTaxDetail,
} from '../prisma/json-types'
import {
  ResponseActiveInstallmentDto,
  ResponseCommunalWasteTaxDetailItemizedDto,
  ResponseCommunalWasteTaxSummaryDetailDto,
  ResponseInstallmentPaymentDetailDto,
  ResponseOneTimePaymentDetailsDto,
  ResponseRealEstateTaxDetailItemizedDto,
  ResponseRealEstateTaxSummaryDetailDto,
} from '../tax/dtos/response.tax.dto'
import { QrCodeGeneratorDto } from '../utils/subservices/dtos/qrcode.dto'

export type ReplaceQrCodeWithGeneratorDto<T extends object> = {
  [K in keyof T]: K extends 'qrCode' ? QrCodeGeneratorDto : T[K]
}

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

export type GetTaxDetailPureOptions<TTaxType extends TaxType> = {
  type: TTaxType
  taxYear: number // daňový rok
  today: Date // aktuálny dátum
  overallAmount: number // suma na zaplatenie
  paymentCalendarThreshold: number // splátková hranica (66 Eur)
  variableSymbol: string
  dateOfValidity: Date | null // dátum právoplatnosti
  installments: { order: number; amount: number }[]
  taxDetails: TaxTypeToTaxDetail[TTaxType]
  specificSymbol: string
  taxPayments: {
    amount: number
    status: PaymentStatus
  }[]
}

export type GetTaxDetailPureResponse<TTaxType extends TaxType> = {
  overallPaid: number
  overallBalance: number
  overallAmount: number
  oneTimePayment: ReplaceQrCodeWithGeneratorDto<ResponseOneTimePaymentDetailsDto>
  installmentPayment: Omit<
    ResponseInstallmentPaymentDetailDto,
    'activeInstallment'
  > & {
    activeInstallment?: ReplaceQrCodeWithGeneratorDto<ResponseActiveInstallmentDto>
  }
  itemizedDetail: TaxTypeToResponseDetailItemizedDto[TTaxType]
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

  generateItemizedTaxDetail: (
    options: TaxTypeToTaxDetail[TTaxType],
  ) => TaxTypeToResponseDetailItemizedDto[TTaxType]

  /** Noris tax subservice instance for this tax type */
  norisSubservice?: AbstractNorisTaxSubservice<TTaxType>
}

export type TaxDefinitionsMap = { [K in TaxType]: TaxDefinition<K> }
