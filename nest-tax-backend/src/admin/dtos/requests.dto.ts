import { ApiProperty } from '@nestjs/swagger'
import { IsObject } from 'class-validator'

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
    description: 'Year of tax',
    default: 2022,
  })
  year: number

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
  })
  @IsObject()
  data: RequestUpdateNorisDeliveryMethodsData
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
