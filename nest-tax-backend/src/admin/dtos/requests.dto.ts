import { ApiProperty } from '@nestjs/swagger'

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

export type NorisRequestGeneral =
  | {
      type: 'fromToDate'

      data: RequestPostNorisPaymentDataLoadDto
    }
  | {
      type: 'variableSymbols'

      data: RequestPostNorisPaymentDataLoadByVariableSymbolsDto
    }
