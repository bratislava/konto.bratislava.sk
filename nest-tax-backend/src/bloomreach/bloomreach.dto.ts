import { ApiProperty } from '@nestjs/swagger'
import { TaxPaymentSource } from '@prisma/client'

export enum BloomreachEventNameEnum {
  TAX = 'tax',
  TAX_PAYMENT = 'tax_payment',
}

export class TaxPaymentBloomreachDataDto {
  @ApiProperty({
    description: 'year',
    example: 2024,
  })
  year: number

  @ApiProperty({
    description: 'amount',
    example: 13.2,
  })
  amount: number

  @ApiProperty({
    description: 'payment_source',
    example: TaxPaymentSource.CARD,
  })
  payment_source: TaxPaymentSource
}

export class TaxBloomreachDataDto {
  @ApiProperty({
    description: 'year',
    example: 2024,
  })
  year: number

  @ApiProperty({
    description: 'amount',
    example: 13.2,
  })
  amount: number
}
