import { ApiProperty } from '@nestjs/swagger'
import { DeliveryMethodNamed, TaxPaymentSource } from '@prisma/client'
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator'

export enum BloomreachEventNameEnum {
  TAX = 'tax',
  TAX_PAYMENT = 'tax_payment',
  UNPAID_TAX_REMINDER = 'unpaid_tax_reminder',
}

export class TaxPaymentBloomreachDataDto {
  @ApiProperty({
    description: 'year',
    example: 2024,
  })
  @IsNumber()
  year: number

  @ApiProperty({
    description: 'amount',
    example: 13.2,
  })
  @IsNumber()
  amount: number

  @ApiProperty({
    description: 'payment_source',
    example: TaxPaymentSource.CARD,
    enumName: 'TaxPaymentSource',
    enum: TaxPaymentSource,
  })
  @IsEnum(TaxPaymentSource)
  payment_source: TaxPaymentSource

  @ApiProperty({
    description:
      'If true, email will be suppressed. Otherwise, email will be sent.',
    example: true,
  })
  @IsBoolean()
  suppress_email: boolean
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

export class UnpaidTaxReminderBloomreachDataDto {
  @ApiProperty({
    description: 'year',
    example: 2024,
  })
  @IsDefined()
  @IsNumber()
  year: number
}
