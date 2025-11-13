import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

import { DeliveryMethod } from '../../noris/utils/noris.types'

export class RequestPostNorisLoadDataDto {
  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  @IsNumber()
  year: number

  @ApiProperty({
    description: 'Birth numbers in format with slash',
    default: ['000000/0000'],
  })
  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty({ each: true })
  birthNumbers: string[]

  @ApiPropertyOptional({
    description:
      'If true, only prepare data (validate and mark as ready) without creating taxes',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  prepareOnly?: boolean
}

export class RequestPostNorisPaymentDataLoadDto {
  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  @IsNumber()
  year: number

  @ApiProperty({
    description: 'From date - if is not set, take one from database',
    default: '2022-01-01',
  })
  @IsDateString()
  fromDate: string

  @ApiProperty({
    description: 'To date - if is not set, take one from database',
    default: '2022-01-02',
  })
  @IsDateString()
  toDate: string

  @ApiProperty({
    description: 'If you want to count also overpayments.',
    default: false,
  })
  @IsBoolean()
  overPayments: boolean
}

export class RequestPostNorisPaymentDataLoadByVariableSymbolsDto {
  @ApiProperty({
    description:
      'Years of taxes for which it should find payments. Used for more effective querying.',
    default: [2022, 2023],
    type: [Number],
  })
  years: number[]

  @ApiProperty({
    description: 'Variable symbols which should be checked.',
    default: ['010010101', '4463782'],
    type: String,
    isArray: true,
  })
  variableSymbols: string[]
}

export class DateRangeDto {
  @ApiProperty({
    description: 'From date',
    default: '2025-10-10',
  })
  @IsDate()
  @Type(() => Date)
  fromDate: Date

  @ApiPropertyOptional({
    description: 'To date',
    default: '2025-10-16',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  toDate?: Date
}

export type RequestUpdateNorisDeliveryMethodsData = {
  [key: string]:
    | { deliveryMethod: DeliveryMethod.CITY_ACCOUNT; date: string }
    | { deliveryMethod: DeliveryMethod.EDESK | DeliveryMethod.POSTAL }
}

export class RequestUpdateNorisDeliveryMethodsDto {
  @ApiProperty({
    description:
      'The new delivery methods for the birth numbers. For city account notification, date must be provided.',
    example: {
      '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
      '010366/554': { deliveryMethod: DeliveryMethod.EDESK },
      '017766/2244': { deliveryMethod: DeliveryMethod.POSTAL },
      '022176/2244': {
        deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
        date: '2024-01-01',
      },
    },
    type: 'object',
    additionalProperties: {
      oneOf: [
        {
          type: 'object',
          properties: {
            deliveryMethod: {
              type: 'string',
              enum: [DeliveryMethod.CITY_ACCOUNT],
            },
            date: {
              type: 'string',
              format: 'date',
            },
          },
          required: ['deliveryMethod', 'date'],
        },
        {
          type: 'object',
          properties: {
            deliveryMethod: {
              type: 'string',
              enum: [DeliveryMethod.EDESK, DeliveryMethod.POSTAL],
            },
          },
          required: ['deliveryMethod'],
        },
      ],
    },
  })
  @IsObject()
  @ValidateNested()
  data: RequestUpdateNorisDeliveryMethodsData
}

export class RequestAdminCreateTestingTaxNorisData {
  @ApiProperty({
    description: 'Variable symbol of the tax',
    example: '0000000001',
  })
  @IsString()
  variableSymbol: string

  @ApiProperty({
    description: 'Delivery method for the tax',
    enum: DeliveryMethod,
    nullable: true,
  })
  @IsEnum(DeliveryMethod)
  @IsOptional()
  deliveryMethod: DeliveryMethod | null

  @ApiProperty({
    description: 'Birth number in format with slash',
    example: '000000/0000',
  })
  @IsString()
  fakeBirthNumber: string

  @ApiProperty({
    description: 'Full name and surname of the tax payer',
    example: 'John Doe',
  })
  @IsString()
  nameSurname: string

  @ApiProperty({
    description: 'Total tax amount as string',
    example: '100.00',
  })
  @IsString()
  taxTotal: string

  @ApiProperty({
    description: 'Amount already paid',
    example: 10.9,
  })
  @IsNumber()
  alreadyPaid: number

  @ApiProperty({
    description: 'Date of tax ruling (dátum právoplatnosti)',
    example: '2024-01-01T07:31:39.916Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateTaxRuling: Date | null
}

export class RequestAdminCreateTestingTaxDto {
  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  @IsNumber()
  year: number

  @ApiProperty({
    description: 'Fake Noris Data',
  })
  @IsObject()
  @ValidateNested()
  norisData: RequestAdminCreateTestingTaxNorisData
}

export class RequestAdminDeleteTaxDto {
  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  @IsNumber()
  year: number

  @ApiProperty({
    description: 'Birth number in format with slash',
    example: '000000/0000',
  })
  @IsString()
  birthNumber: string
}

export class RequestPostReportingSendReport {
  @ApiProperty({
    description: 'Date since when reports should be generated',
    default: 2022,
  })
  @IsDateString()
  date: string

  @ApiProperty({
    description: 'Emails the report will be sent to',
    default: ['test@bratislava.sk'],
    type: [String],
  })
  @IsEmail({}, { each: true })
  emailRecipients: string[]
}

export type NorisRequestGeneral =
  | {
      type: 'fromToDate'

      data: RequestPostNorisPaymentDataLoadDto
    }
  | {
      type: 'variableSymbols'

      data: RequestPostNorisPaymentDataLoadByVariableSymbolsDto
    }
