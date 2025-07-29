import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  DeliveryMethodNamed,
  TaxDetailareaType,
  TaxDetailType,
} from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'

import {
  DeliveryMethodActiveAndLockedDto,
  DeliveryMethodDto,
  DeliveryMethodDtoDeliveryMethodEnum,
} from 'openapi-clients/city-account'

export enum TaxDetailTypeEnum {
  APARTMENT = 'APARTMENT',
  CONSTRUCTION = 'CONSTRUCTION',
  GROUND = 'GROUND',
}

export enum TaxPaidStatusEnum {
  NOT_PAID = 'NOT_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVER_PAID = 'OVER_PAID',
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

export class ResponseTaxPayerDto {
  @ApiProperty({
    description: 'Numeric id of tax payer',
    default: 1,
  })
  @IsNumber()
  id: number

  @ApiProperty({
    description: 'Uuid of tax payer',
    default: '15fc5751-d5e2-4e14-9f8d-dc4b3e1dec27',
  })
  @IsUUID()
  uuid: string

  @ApiProperty({
    description: 'Created at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date

  @ApiProperty({
    description: 'Updated at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date

  @ApiProperty({
    description: 'Is tax payer active',
    default: true,
  })
  @IsBoolean()
  active: boolean

  @ApiProperty({
    description: 'Permanent address of tax payer',
    default: 'Bratislava, Hlavne námestie 1',
  })
  @IsString()
  @IsOptional()
  permanentResidenceAddress: string | null

  @ApiProperty({
    description: 'Id of tax payer from Noris',
    default: '12345',
  })
  @IsString()
  @IsOptional()
  externalId: string | null

  @ApiProperty({
    description: 'Name of taxpayer',
    default: 'Bratislavčan Daňový',
  })
  @IsString()
  @IsOptional()
  name: string | null

  @ApiProperty({
    description: 'Text of description of name for pdf',
    default: 'Meno daňovníka/ subjektu',
  })
  @IsString()
  @IsOptional()
  nameTxt: string | null

  @ApiProperty({
    description: 'Text of description of street for pdf',
    default: 'Ulica trvalého pobytu',
  })
  @IsString()
  @IsOptional()
  permanentResidenceStreetTxt: string | null

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

  // TODO more missing properties which are sent
  @ApiProperty({
    description: 'Birth number with slash',
    default: '920101/1111',
  })
  @IsString()
  birthNumber: string

  @ApiProperty({
    description: 'Id of tax administrator - id is from Noris',
    default: 5_172_727,
  })
  @IsNumber()
  @IsOptional()
  taxAdministratorId: number | null
}

export class ResponseTaxDetailInstallmentsDto {
  @ApiProperty({
    description: 'Id of instalments, installments are ordered by this value',
    default: 1,
  })
  id: number

  @ApiProperty({
    description: 'Created at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Updated at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Numeric id of tax (foreign key)',
    default: 1,
  })
  taxId: number

  @ApiProperty({
    description: 'Order of installment',
    default: null,
    nullable: true,
  })
  order: string | null

  @ApiProperty({
    description: 'Amount to pay of installment in cents - integer',
    default: 1000,
  })
  amount: number

  @ApiProperty({
    description: 'Text of number of installment',
    default: 1000,
  })
  text: string | null
}

export class ResponseTaxDetailsDto {
  @ApiProperty({
    description: 'Numeric id of tax detail',
    default: 1,
  })
  id: number

  @ApiProperty({
    description: 'Created at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Updated at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Numeric id of tax (foreign key)',
    default: 1,
  })
  taxId: number

  @ApiProperty({
    description: 'Type of tax detail - object of tax',
    default: TaxDetailType.GROUND,
    enumName: 'TaxDetailTypeEnum',
    enum: TaxDetailType,
  })
  type: TaxDetailType

  @ApiProperty({
    description: 'Area type of tax detail - exact type of object of tax',
    default: TaxDetailareaType.byt,
    enumName: 'TaxDetailareaType',
    enum: TaxDetailareaType,
  })
  areaType: TaxDetailareaType

  @ApiProperty({
    description: 'Area of tax detail - square meters',
    default: '0,00',
  })
  area: string | null

  @ApiProperty({
    description: 'Base of tax pare meter',
    default: 0,
  })
  base: number

  @ApiProperty({
    description: 'Real tax per area type tax detail',
    default: 0,
  })
  amount: number
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

export class ResponseTaxDto {
  @ApiProperty({
    description: 'Numeric id of tax',
    default: 1,
  })
  @IsNumber()
  id: number

  @ApiProperty({
    description: 'Uuid of tax',
    default: '15fc5751-d5e2-4e14-9f8d-dc4b3e1dec27',
  })
  @IsUUID()
  uuid: string

  @ApiProperty({
    description: 'Created at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date

  @ApiProperty({
    description: 'Updated at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date

  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  @IsNumber()
  year: number

  @ApiProperty({
    description: 'Numeric id of taxpayer',
    default: 1,
  })
  @IsNumber()
  taxPayerId: number

  @ApiProperty({
    description: 'Amount to pay in cents - integer',
    default: 1000,
  })
  @IsNumber()
  amount: number

  @ApiProperty({
    description: 'Amount which was already paid in cents - integer',
    default: 1000,
  })
  @IsNumber()
  paidAmount: number

  @ApiProperty({
    description: 'Variable symbol of payment',
    default: 12_345_678,
  })
  @IsString()
  variableSymbol: string

  @ApiProperty({
    description: 'Tax Id from order of exact year',
    default: '1234',
  })
  @IsOptional()
  @IsString()
  taxId: string | null

  @ApiProperty({
    description: 'Date of tax order.',
    default: '2022-01-01',
  })
  @IsOptional()
  @IsString()
  dateCreateTax: string | null

  @ApiProperty({
    description: 'Date and time of tax ruling (právoplatnosť rozhodnutia)',
    default: '2023-04-13T14:39:49.004Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dateTaxRuling: Date | null

  @ApiProperty({
    description: 'Part of tax amount for lands in cents in Eur.',
    default: 1000,
  })
  @IsNumber()
  @IsOptional()
  taxLand: number | null

  @ApiProperty({
    description: 'Part of tax amount for constructions in cents in Eur.',
    default: 1000,
  })
  @IsNumber()
  @IsOptional()
  taxConstructions: number | null

  @ApiProperty({
    description: 'Part of tax amount for flats in cents in Eur.',
    default: 1000,
  })
  @IsNumber()
  @IsOptional()
  taxFlat: number | null

  @ApiProperty({
    description:
      'Qr code use for pay in web in Base64 representing image of paybysquare QRcode',
    default: 'somebase64string',
  })
  @IsString()
  @IsOptional()
  qrCodeWeb: string | null

  @ApiProperty({
    description:
      'Qr code use for pay in email in Base64 representing image of paybysquare QRcode',
    default: 'somebase64string',
  })
  @IsString()
  @IsOptional()
  qrCodeEmail: string | null

  @ApiProperty({
    description: 'Type of paid status',
    example: TaxPaidStatusEnum.PARTIALLY_PAID,
    enumName: 'TaxPaidStatusEnum',
    enum: TaxPaidStatusEnum,
  })
  @IsEnum(TaxPaidStatusEnum)
  paidStatus: TaxPaidStatusEnum

  @ApiProperty({
    description:
      'Is tax payable (is tax from this year), and frontend can show payment data?',
    example: true,
  })
  @IsBoolean()
  isPayable: boolean

  @ApiProperty({
    description:
      'Whether PDF export is available, since 2024 we stopped generating PDFs',
    default: false,
  })
  @IsBoolean()
  pdfExport: boolean

  @ApiProperty({
    description: 'Tax payer data',
    default: {
      id: 1,
      uuid: '15fc5751-d5e2-4e14-9f8d-dc4b3e1dec27',
      createdAt: '2023-04-13T14:39:49.004Z',
      updatedAt: '2023-04-13T14:39:49.004Z',
      active: true,
      permanentResidenceAddress: 'Bratislava, Hlavné námestie 1',
      externalId: '1234',
      name: 'Bratislavčan Daňový',
      nameTxt: 'Meno daňovníka',
      permanentResidenceStreetTxt: 'Trvalý pobyt',
      permanentResidenceStreet: 'Uršulínska 6 3/4',
      permanentResidenceZip: '811 01',
      permanentResidenceCity: 'Bratislava',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseTaxPayerDto)
  taxPayer: ResponseTaxPayerDto

  @ApiProperty({
    description:
      'Installments of payment tax - it can be array of 1 value or 3 values',
    default: [
      {
        id: 1,
        createdAt: '2023-04-13T14:39:49.004Z',
        updatedAt: '2023-04-13T14:39:49.004Z',
        taxId: 1,
        order: null,
        amount: 1000,
        text: 'Splátka 1',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseTaxDetailInstallmentsDto)
  taxInstallments: ResponseTaxDetailInstallmentsDto[]

  @ApiProperty({
    description: 'Tax administrator',
    default: [
      {
        id: 20,
        createdAt: '2023-04-13T14:39:49.004Z',
        updatedAt: '2023-04-13T14:39:49.004Z',
        taxId: 1,
        type: 'APARTMENT',
        areaType: 'nebyt',
        area: null,
        base: 0,
        amount: 0,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseTaxDetailsDto)
  taxDetails: ResponseTaxDetailsDto[]

  @ApiProperty({
    description:
      'When were last checked payments for this tax with automatic task.',
    default: '2023-04-13T14:39:49.004Z',
  })
  @IsDate()
  @Type(() => Date)
  lastCheckedPayments: Date

  @ApiProperty({
    description:
      'When were last checked updates for this tax with automatic task.',
    default: '2023-04-13T14:39:49.004Z',
  })
  @IsDate()
  @Type(() => Date)
  lastCheckedUpdates: Date

  @ApiProperty({
    description: 'delivery_method',
    example: DeliveryMethodNamed.CITY_ACCOUNT,
    enumName: 'DeliveryMethodNamed',
    enum: DeliveryMethodNamed,
  })
  @IsEnum(DeliveryMethodNamed)
  @IsOptional()
  deliveryMethod: DeliveryMethodNamed | null

  @ApiProperty({
    description:
      'Has the unpaid tax notification event been sent to Bloomreach for this tax',
    example: true,
  })
  @IsBoolean()
  bloomreachUnpaidTaxReminderSent: boolean

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

export class ResponseGetTaxesBodyDto {
  @ApiProperty({
    description: 'Numeric id of tax',
    default: 1,
  })
  id: number

  @ApiProperty({
    description: 'Uuid of tax',
    default: '00000000-0000-0000-0000-000000000000',
  })
  uuid: string

  @ApiProperty({
    description: 'Date of tax creation in backend',
    default: '2024-01-01',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Amount to paid in cents',
    default: 1000,
  })
  amount: number

  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  year: number

  @ApiProperty({
    description: 'Amount already paid',
    default: 900,
  })
  paidAmount: number

  @ApiProperty({
    description: 'Type of paid status',
    example: TaxPaidStatusEnum.PARTIALLY_PAID,
    enumName: 'TaxPaidStatusEnum',
    enum: TaxPaidStatusEnum,
  })
  paidStatus: TaxPaidStatusEnum

  @ApiProperty({
    description:
      'Is tax payable (is tax from this year), and frontend can show payment data?',
    example: true,
  })
  isPayable: boolean
}

export class ResponseGetTaxesDto {
  @ApiProperty({
    description: 'Birth number of user is in Noris actual or historical Tax',
    example: true,
  })
  @IsBoolean()
  isInNoris: boolean

  @ApiProperty({
    isArray: true,
    type: ResponseGetTaxesBodyDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseGetTaxesBodyDto)
  items: ResponseGetTaxesBodyDto[]

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
    default: TaxDetailareaType.byt,
    enumName: 'TaxDetailareaType',
    enum: TaxDetailareaType,
  })
  @IsEnum(TaxDetailareaType)
  type: TaxDetailareaType

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
    default: TaxDetailareaType.byt,
    enumName: 'TaxDetailareaType',
    enum: TaxDetailareaType,
  })
  @IsEnum(TaxDetailareaType)
  type: TaxDetailareaType

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
    default: TaxDetailareaType.RESIDENTIAL,
    enumName: 'TaxDetailareaType',
    enum: TaxDetailareaType,
  })
  @IsEnum(TaxDetailareaType)
  type: TaxDetailareaType

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

export class ResponseTaxDetailItemizedDto {
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
    type: [ResponseApartmentTaxDetailDto],
    isArray: true,
    example: [{ type: TaxDetailareaType.byt, base: 100, amount: 100 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseApartmentTaxDetailDto)
  apartmentTaxDetail: ResponseApartmentTaxDetailDto[]

  @ApiProperty({
    description: 'Ground tax itemized',
    type: [ResponseGroundTaxDetailDto],
    example: [
      {
        type: TaxDetailareaType.A,
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
    type: [ResponseConstructionTaxDetailDto],
    isArray: true,
    example: [{ type: TaxDetailareaType.RESIDENTIAL, base: 100, amount: 100 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseConstructionTaxDetailDto)
  constructionTaxDetail: ResponseConstructionTaxDetailDto[]
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

  @ApiPropertyOptional({
    description: 'Link to payment gateway (only when type is ONE_TIME_PAYMENT)',
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentGatewayLink?: string
}

export class ResponseInstallmentItemDto {
  @ApiProperty({ description: 'Installment number', example: 1 })
  @IsNumber()
  @IsPositive()
  installmentNumber: number

  @ApiPropertyOptional({
    description: 'Due date',
    required: false,
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
}

export class ResponseActiveInstallmentDto {
  @ApiProperty({
    description: 'Remaining amount to pay in the installment',
    example: 50,
  })
  @IsNumber()
  @IsPositive()
  remainingAmount: number

  @ApiProperty({ description: 'Variable symbol', required: false })
  @IsString()
  variableSymbol: string

  @ApiProperty({ description: 'QR code', required: false })
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
    enum: ['BELOW_THRESHOLD', 'AFTER_DATE'],
    required: false,
  })
  @IsEnum(InstallmentPaymentReasonNotPossibleEnum)
  @IsOptional()
  reasonNotPossible?: InstallmentPaymentReasonNotPossibleEnum

  @ApiPropertyOptional({
    description: 'List of exactly 3 installments or none at all',
    type: [ResponseInstallmentItemDto],
    isArray: true,
    example: [
      {
        installmentNumber: 1,
        dueDate: '2023-04-13',
        status: InstallmentPaidStatusEnum.NOT_PAID,
        remainingAmount: 50,
      },
      {
        installmentNumber: 2,
        dueDate: '2023-04-13',
        status: InstallmentPaidStatusEnum.NOT_PAID,
        remainingAmount: 50,
      },
      {
        installmentNumber: 3,
        dueDate: '2023-04-13',
        status: InstallmentPaidStatusEnum.NOT_PAID,
        remainingAmount: 50,
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

export class DeliveryMethodDtoClass implements DeliveryMethodDto {
  @ApiProperty({
    enum: ['EDESK', 'CITY_ACCOUNT', 'POSTAL'],
    description: 'Delivery method',
  })
  @IsString()
  deliveryMethod: DeliveryMethodDtoDeliveryMethodEnum

  @ApiProperty({
    required: false,
    description: 'Date (required for CITY_ACCOUNT method)',
  })
  @IsOptional()
  @IsString()
  date?: string
}

export class DeliveryMethodActiveAndLockedDtoClass
  implements DeliveryMethodActiveAndLockedDto
{
  @ApiProperty({
    type: DeliveryMethodDtoClass,
    description: 'Active delivery method',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryMethodDtoClass)
  active: DeliveryMethodDto

  @ApiProperty({
    type: DeliveryMethodDtoClass,
    required: false,
    description: 'Delivery method at lock date this year.',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryMethodDtoClass)
  locked?: DeliveryMethodDto
}

export class ResponseTaxSummaryDetailDto {
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
    description: 'Itemized details',
    type: ResponseTaxDetailItemizedDto,
    isArray: true,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseTaxDetailItemizedDto)
  itemizedDetail: ResponseTaxDetailItemizedDto

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
    description: 'Delivery methods bot locked and latest.',
    type: DeliveryMethodActiveAndLockedDtoClass,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryMethodActiveAndLockedDtoClass)
  deliveryMethod: DeliveryMethodActiveAndLockedDtoClass | null
}
