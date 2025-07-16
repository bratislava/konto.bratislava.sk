import { ApiProperty } from '@nestjs/swagger'
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

import { TaxPaymentBloomreachDataDto } from '../../bloomreach/bloomreach.dto'
import { DeliveryMethod } from '../../noris/noris.types'

export class RequestPostNorisLoadDataDto {
  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  year: number

  @ApiProperty({
    description: 'Birth numbers or ALL',
    default: ['000000/0000'],
  })
  birthNumbers: string[] | 'All'
}

export class CreateBirthNumbersRequestDto {
  @ApiProperty({
    description:
      'Birth numbers which should be added to tax payers in database. They must be in format with slash.',
    default: ['000000/0000'],
    type: [String],
  })
  birthNumbers: string[]
}

export class RequestPostNorisPaymentDataLoadDto {
  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  year: number

  @ApiProperty({
    description: 'From date - if is not set, take one from database',
    default: '2022-01-01',
  })
  fromDate: string

  @ApiProperty({
    description: 'To date - if is not set, take one from database',
    default: '2022-01-02',
  })
  toDate: string

  @ApiProperty({
    description: 'If you want to count also overpayments.',
    default: false,
  })
  overPayments: Boolean
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
    description: 'Amount already paid as string',
    example: '0.00',
  })
  @IsString()
  alreadyPaid: string

  @ApiProperty({
    description: 'Date of tax ruling (dátum právoplatnosti)',
    example: '2024-01-01T14:39:49.004Z',
  })
  @IsString()
  @IsOptional()
  dateTaxRuling: string | null
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

export class RequestAdminBloomreachCustomerEventTaxPaymentDto {
  @ApiProperty({
    description: 'Fake Bloomreach Data',
  })
  @IsObject()
  @ValidateNested()
  bloomreachData: TaxPaymentBloomreachDataDto

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
    description: 'Email the report will be sent to',
    default: 'test@bratislava.sk',
  })
  @IsEmail()
  email: string
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
