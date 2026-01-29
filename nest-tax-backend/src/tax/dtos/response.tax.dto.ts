import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TaxType } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator'

import { RealEstateTaxAreaType } from '../../prisma/json-types'

export enum TaxDetailTypeEnum {
  APARTMENT = 'APARTMENT',
  CONSTRUCTION = 'CONSTRUCTION',
  GROUND = 'GROUND',
}

export enum TaxStatusEnum {
  NOT_PAID = 'NOT_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVER_PAID = 'OVER_PAID',
  AWAITING_PROCESSING = 'AWAITING_PROCESSING',
  CANCELLED = 'CANCELLED',
}

export enum TaxAvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  LOOKING_FOR_YOUR_TAX = 'LOOKING_FOR_YOUR_TAX',
  TAX_NOT_ON_RECORD = 'TAX_NOT_ON_RECORD',
}

export enum OneTimePaymentReasonNotPossibleEnum {
  ALREADY_PAID = 'ALREADY_PAID',
}

export enum OneTimePaymentTypeEnum {
  ONE_TIME_PAYMENT = 'ONE_TIME_PAYMENT',
  REMAINING_AMOUNT_PAYMENT = 'REMAINING_AMOUNT_PAYMENT',
}

export enum InstallmentPaymentReasonNotPossibleEnum {
  BELOW_THRESHOLD = 'BELOW_THRESHOLD',
  AFTER_DUE_DATE = 'AFTER_DUE_DATE',
  ALREADY_PAID = 'ALREADY_PAID',
}

export enum InstallmentPaidStatusEnum {
  NOT_PAID = 'NOT_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVER_PAID = 'OVER_PAID',
  AFTER_DUE_DATE = 'AFTER_DUE_DATE',
}

export class ResponseTaxAdministratorDto {
  @ApiProperty({
    description: 'Name of the tax administrator',
    example: 'John Doe',
  })
  @IsString()
  name: string

  @ApiProperty({
    description: 'Phone number of the tax administrator',
    example: '+421 123 456 789',
  })
  @IsString()
  phoneNumber: string

  @ApiProperty({
    description: 'Email address of the tax administrator',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  email: string
}

export class ResponseGetTaxesListBodyDto {
  @ApiPropertyOptional({
    description: 'Date of tax delivery to city account',
    default: '2024-01-01',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdAt?: Date

  @ApiPropertyOptional({
    description: 'Amount to be paid in cents',
    default: 1000,
  })
  @IsNumber()
  @IsOptional()
  amountToBePaid?: number

  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  @IsNumber()
  year: number

  @ApiProperty({
    description: 'Type of paid status',
    example: TaxStatusEnum.PARTIALLY_PAID,
    enumName: 'TaxStatusEnum',
    enum: TaxStatusEnum,
  })
  @IsEnum(TaxStatusEnum)
  status: TaxStatusEnum

  @ApiProperty({
    description: 'Type of tax',
    example: TaxType.DZN,
    enumName: 'TaxType',
    enum: TaxType,
  })
  @IsEnum(TaxType)
  type: TaxType

  @ApiProperty({
    description: 'Order of tax for given year and type',
    default: 1,
  })
  @IsNumber()
  order: number
}

export class ResponseGetTaxesListDto {
  @ApiProperty({
    description: 'Tax availability status',
    example: TaxAvailabilityStatus.AVAILABLE,
    enumName: 'TaxAvailabilityStatus',
    enum: TaxAvailabilityStatus,
  })
  @IsEnum(TaxAvailabilityStatus)
  availabilityStatus: TaxAvailabilityStatus

  @ApiProperty({
    isArray: true,
    type: ResponseGetTaxesListBodyDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseGetTaxesListBodyDto)
  items: ResponseGetTaxesListBodyDto[]

  @ApiProperty({
    description: 'Assigned tax administrator',
    type: ResponseTaxAdministratorDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseTaxAdministratorDto)
  @IsOptional()
  taxAdministrator: ResponseTaxAdministratorDto | null
}

export class ResponseApartmentTaxDetailDto {
  @ApiProperty({
    description: 'Type of apartment',
    default: RealEstateTaxAreaType.byt,
    enumName: 'RealEstateTaxAreaType',
    enum: RealEstateTaxAreaType,
  })
  @IsEnum(RealEstateTaxAreaType)
  type: RealEstateTaxAreaType

  @ApiProperty({
    description: 'Base of tax in m^2',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  base: number

  @ApiProperty({
    description: 'Amount of tax in Eur',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  amount: number
}

export class ResponseGroundTaxDetailDto {
  @ApiProperty({
    description: 'Type of area',
    default: RealEstateTaxAreaType.byt,
    enumName: 'RealEstateTaxAreaType',
    enum: RealEstateTaxAreaType,
  })
  @IsEnum(RealEstateTaxAreaType)
  type: RealEstateTaxAreaType

  @ApiPropertyOptional({
    description: 'Area of taxed ground in m^2',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  area?: string

  @ApiProperty({
    description: 'Base of tax in Eur',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  base: number

  @ApiProperty({
    description: 'Amount of tax in Eur',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  amount: number
}

export class ResponseConstructionTaxDetailDto {
  @ApiProperty({
    description: 'Type of construction',
    default: RealEstateTaxAreaType.RESIDENTIAL,
    enumName: 'RealEstateTaxAreaType',
    enum: RealEstateTaxAreaType,
  })
  @IsEnum(RealEstateTaxAreaType)
  type: RealEstateTaxAreaType

  @ApiProperty({
    description: 'Base of tax in m^2',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  base: number

  @ApiProperty({
    description: 'Amount of tax in Eur',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  amount: number
}

export class ResponseOneTimePaymentDetailsDto {
  @ApiProperty({
    description: 'Indicates if one-time payment is possible.',
    example: true,
  })
  @IsBoolean()
  isPossible: boolean

  @ApiPropertyOptional({
    description: 'Type of payment',
    enum: OneTimePaymentTypeEnum,
    required: false,
  })
  @IsEnum(OneTimePaymentTypeEnum)
  @IsOptional()
  type?: OneTimePaymentTypeEnum

  @ApiPropertyOptional({
    description: 'Reason why payment is not possible',
    enum: OneTimePaymentReasonNotPossibleEnum,
    required: false,
  })
  @IsEnum(OneTimePaymentReasonNotPossibleEnum)
  @IsOptional()
  reasonNotPossible?: OneTimePaymentReasonNotPossibleEnum

  @ApiPropertyOptional({
    description: 'Payment amount',
    example: 10_050,
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number

  @ApiPropertyOptional({
    description: 'Due date',
    required: false,
    example: '2023-04-13',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date

  @ApiPropertyOptional({
    description: 'QR code for payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  qrCode?: string

  @ApiPropertyOptional({
    description: 'Variable symbol for payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  variableSymbol?: string
}

export class ResponseInstallmentItemDto {
  @ApiProperty({ description: 'Installment number', example: 1 })
  @IsNumber()
  @IsPositive()
  installmentNumber: number

  @ApiPropertyOptional({
    description: 'Due date',
    example: '2023-04-13',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date

  @ApiProperty({
    description: 'Payment status',
    enum: InstallmentPaidStatusEnum,
    enumName: 'InstallmentPaidStatusEnum',
  })
  @IsEnum(InstallmentPaidStatusEnum)
  status: InstallmentPaidStatusEnum

  @ApiProperty({ description: 'Remaining amount to pay', example: 50 })
  @IsNumber()
  @IsPositive()
  remainingAmount: number

  @ApiProperty({ description: 'Total amount to pay', example: 50 })
  @IsNumber()
  @IsPositive()
  totalInstallmentAmount: number
}

export class ResponseActiveInstallmentDto {
  @ApiProperty({
    description: 'Remaining amount to pay in the installment',
    example: 50,
  })
  @IsNumber()
  @IsPositive()
  remainingAmount: number

  @ApiProperty({ description: 'Variable symbol' })
  @IsString()
  variableSymbol: string

  @ApiPropertyOptional({
    description: 'Due date',
    example: '2023-04-13',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date

  @ApiProperty({ description: 'QR code' })
  @IsString()
  qrCode: string
}

export class ResponseInstallmentPaymentDetailDto {
  @ApiProperty({
    description: 'Indicates if installment payment is possible',
    example: true,
  })
  @IsBoolean()
  isPossible: boolean

  @ApiPropertyOptional({
    description: 'Reason why installment is not possible',
    enum: InstallmentPaymentReasonNotPossibleEnum,
    required: false,
  })
  @IsEnum(InstallmentPaymentReasonNotPossibleEnum)
  @IsOptional()
  reasonNotPossible?: InstallmentPaymentReasonNotPossibleEnum

  @ApiPropertyOptional({
    description: 'Latest possible due date.',
    required: false,
    example: '2023-04-13',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDateLastPayment?: Date

  @ApiPropertyOptional({
    description:
      'List of 3 or 4 installments depending on tax type (4 for PKO, 3 for others), or none at all',
    type: ResponseInstallmentItemDto,
    isArray: true,
    example: [
      {
        installmentNumber: 1,
        dueDate: '2025-08-01',
        status: InstallmentPaidStatusEnum.AFTER_DUE_DATE,
        remainingAmount: 30,
        totalInstallmentAmount: 50,
      },
      {
        installmentNumber: 2,
        dueDate: '2025-09-01',
        status: InstallmentPaidStatusEnum.NOT_PAID,
        remainingAmount: 80,
        totalInstallmentAmount: 50,
      },
      {
        installmentNumber: 3,
        dueDate: '2025-11-01',
        status: InstallmentPaidStatusEnum.NOT_PAID,
        remainingAmount: 50,
        totalInstallmentAmount: 50,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseInstallmentItemDto)
  installments?: ResponseInstallmentItemDto[]

  @ApiPropertyOptional({
    description: 'Details of active installment',
    type: ResponseActiveInstallmentDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseActiveInstallmentDto)
  activeInstallment?: ResponseActiveInstallmentDto
}

export class ResponseTaxPayerReducedDto {
  @ApiProperty({
    description: 'Name of taxpayer',
    default: 'Bratislavčan Daňový',
  })
  @IsString()
  @IsOptional()
  name: string | null

  @ApiProperty({
    description: 'Street of permanent residence with number',
    default: 'Uršulínska 6 3/6',
  })
  @IsString()
  @IsOptional()
  permanentResidenceStreet: string | null

  @ApiProperty({
    description: 'Zip of permanent residence with number',
    default: '811 01',
  })
  @IsString()
  @IsOptional()
  permanentResidenceZip: string | null

  @ApiProperty({
    description: 'City of permanent residence with number',
    default: 'Bratislava',
  })
  @IsString()
  @IsOptional()
  permanentResidenceCity: string | null

  @ApiProperty({
    description: 'Id of tax payer from Noris',
    default: '12345',
  })
  @IsString()
  @IsOptional()
  externalId: string | null
}

export class ResponseTaxSummaryDetailBaseDto {
  @ApiProperty({
    description: 'Payment status',
    example: TaxStatusEnum.PAID,
    enumName: 'TaxStatusEnum',
    enum: TaxStatusEnum,
  })
  @IsEnum(TaxStatusEnum)
  paidStatus: TaxStatusEnum

  @ApiProperty({ description: 'Year of tax', example: 2024 })
  @IsNumber()
  @IsPositive()
  year: number

  @ApiProperty({ description: 'Order of tax', example: 1 })
  @IsNumber()
  @IsPositive()
  order: number

  @ApiProperty({ description: 'Total amount paid', example: 150 })
  @IsNumber()
  @IsPositive()
  overallPaid: number

  @ApiProperty({ description: 'Total remaining balance', example: 50 })
  @IsNumber()
  @IsPositive()
  overallBalance: number

  @ApiProperty({ description: 'Total tax amount', example: 200 })
  @IsNumber()
  @IsPositive()
  overallAmount: number

  @ApiProperty({
    description: 'One-time payment details',
    type: ResponseOneTimePaymentDetailsDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseOneTimePaymentDetailsDto)
  oneTimePayment: ResponseOneTimePaymentDetailsDto

  @ApiProperty({
    description: 'Installment payment details',
    type: ResponseInstallmentPaymentDetailDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseInstallmentPaymentDetailDto)
  installmentPayment: ResponseInstallmentPaymentDetailDto

  @ApiProperty({
    description: 'Assigned tax administrator',
    type: ResponseTaxAdministratorDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseTaxAdministratorDto)
  @IsOptional()
  taxAdministrator: ResponseTaxAdministratorDto | null

  @ApiProperty({
    description: 'Tax payer data',
    type: ResponseTaxPayerReducedDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseTaxPayerReducedDto)
  taxPayer: ResponseTaxPayerReducedDto
}

export class ResponseRealEstateTaxDetailItemizedDto {
  @ApiProperty({
    description: 'Total amount of tax for apartment',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  apartmentTotalAmount: number

  @ApiProperty({
    description: 'Total amount of tax for construction',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  constructionTotalAmount: number

  @ApiProperty({
    description: 'Total amount of tax for ground',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  groundTotalAmount: number

  @ApiProperty({
    description: 'Apartment tax itemized',
    type: ResponseApartmentTaxDetailDto,
    isArray: true,
    example: [{ type: RealEstateTaxAreaType.byt, base: 100, amount: 100 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseApartmentTaxDetailDto)
  apartmentTaxDetail: ResponseApartmentTaxDetailDto[]

  @ApiProperty({
    description: 'Ground tax itemized',
    type: ResponseGroundTaxDetailDto,
    example: [
      {
        type: RealEstateTaxAreaType.A,
        area: '100m2',
        base: 100,
        amount: 100,
      },
    ],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseGroundTaxDetailDto)
  groundTaxDetail: ResponseGroundTaxDetailDto[]

  @ApiProperty({
    description: 'Construction tax itemized',
    type: ResponseConstructionTaxDetailDto,
    isArray: true,
    example: [
      { type: RealEstateTaxAreaType.RESIDENTIAL, base: 100, amount: 100 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseConstructionTaxDetailDto)
  constructionTaxDetail: ResponseConstructionTaxDetailDto[]
}

export class ResponseRealEstateTaxSummaryDetailDto extends ResponseTaxSummaryDetailBaseDto {
  @ApiProperty({
    description: 'Type of tax.',
    example: 'DZN',
    enum: ['DZN'],
  })
  @IsEnum(['DZN'])
  type: 'DZN'

  @ApiProperty({
    description: 'Itemized details',
    type: ResponseRealEstateTaxDetailItemizedDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseRealEstateTaxDetailItemizedDto)
  itemizedDetail: ResponseRealEstateTaxDetailItemizedDto
}

export class ResponseCommunalWasteTaxAddressDto {
  @ApiProperty({
    description: 'Street name',
    example: 'Uršulínska',
  })
  @IsString()
  street: string

  @ApiProperty({
    description: 'Orientation number',
    example: '123',
  })
  @IsString()
  orientationNumber: string
}

export class ResponseCommunalWasteTaxItemizedAddressDto {
  @ApiProperty({
    description: 'Container volume in liters',
    example: 120,
  })
  @IsNumber()
  @IsInt()
  @IsPositive()
  containerVolume: number

  @ApiProperty({
    description: 'Number of containers',
    example: 2,
  })
  @IsNumber()
  @IsInt()
  @IsPositive()
  containerCount: number

  @ApiProperty({
    description: 'Number of waste disposals',
    example: 52,
  })
  @IsNumber()
  @IsInt()
  @IsPositive()
  numberOfDisposals: number

  @ApiProperty({
    description: 'Unit tax rate (sadzba)',
    example: 50,
  })
  @IsNumber()
  @IsInt()
  @IsPositive()
  unitRate: number

  @ApiProperty({
    description: 'Container type (druh_nadoby)',
    example: 'Plastová nádoba',
  })
  @IsString()
  containerType: string

  @ApiProperty({
    description: 'Fee amount (poplatok)',
    example: 5200,
  })
  @IsNumber()
  @IsInt()
  @IsPositive()
  fee: number
}

export class ResponseCommunalWasteTaxAddressDetailItemizedDto {
  @ApiProperty({
    description: 'Address information',
    type: ResponseCommunalWasteTaxAddressDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseCommunalWasteTaxAddressDto)
  address: ResponseCommunalWasteTaxAddressDto

  @ApiProperty({
    description: 'Total tax amount for this address',
    example: 104,
  })
  @IsNumber()
  @IsPositive()
  totalAmount: number

  @ApiProperty({
    description: 'Itemized container details',
    type: ResponseCommunalWasteTaxItemizedAddressDto,
    isArray: true,
    example: [
      {
        containerVolume: 120,
        containerCount: 2,
        numberOfDisposals: 52,
        sadzba: 0.5,
        poplatok: 52,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseCommunalWasteTaxItemizedAddressDto)
  itemizedContainers: ResponseCommunalWasteTaxItemizedAddressDto[]
}

export class ResponseCommunalWasteTaxDetailItemizedDto {
  @ApiProperty({
    description: 'Itemized details by address',
    type: ResponseCommunalWasteTaxAddressDetailItemizedDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseCommunalWasteTaxAddressDetailItemizedDto)
  addressDetail: ResponseCommunalWasteTaxAddressDetailItemizedDto[]
}

export class ResponseCommunalWasteTaxSummaryDetailDto extends ResponseTaxSummaryDetailBaseDto {
  @ApiProperty({
    description: 'Type of tax.',
    example: 'KO',
    enum: ['KO'],
  })
  @IsEnum(['KO'])
  type: 'KO'

  @ApiProperty({
    description: 'Itemized details',
    type: ResponseCommunalWasteTaxDetailItemizedDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseCommunalWasteTaxDetailItemizedDto)
  itemizedDetail: ResponseCommunalWasteTaxDetailItemizedDto
}

export type ResponseAnyTaxSummaryDetailDto =
  | ResponseRealEstateTaxSummaryDetailDto
  | ResponseCommunalWasteTaxSummaryDetailDto
