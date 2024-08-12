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
    description: 'user name to noris',
    default: 'test',
  })
  msq_username: string

  @ApiProperty({
    description: 'password to noris',
    default: 'test',
  })
  msq_password: string

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
    description: 'If is possible to send confirmation email',
    default: true,
  })
  sendConfEmails: Boolean

  @ApiProperty({
    description:
      'If you want to count also overpayments. It is recommended to choose sendConfEmails to false if this is true',
    default: false,
  })
  overPayments: Boolean
}
