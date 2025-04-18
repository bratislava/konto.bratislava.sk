import { ApiProperty } from '@nestjs/swagger'
import { DeliveryMethodNamed, TaxPaymentSource } from '@prisma/client'
import { IsDefined, IsEnum, IsNumber, IsOptional } from 'class-validator'

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
  @IsDefined()
  @IsNumber()
  year: number

  @ApiProperty({
    description: 'amount',
    example: 13.2,
  })
  @IsDefined()
  @IsNumber()
  amount: number

  @ApiProperty({
    description: 'delivery_method',
    example: DeliveryMethodNamed.POSTAL,
    enumName: 'DeliveryMethodNamed',
  })
  @IsEnum(DeliveryMethodNamed)
  @IsOptional()
  delivery_method: DeliveryMethodNamed | null
}
