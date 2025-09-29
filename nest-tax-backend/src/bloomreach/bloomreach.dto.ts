import { ApiProperty } from '@nestjs/swagger'
import { DeliveryMethodNamed, TaxPaymentSource, TaxType } from '@prisma/client'
import { IsDefined, IsEnum, IsNumber, IsOptional } from 'class-validator'

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
    description: 'Type of tax',
    example: TaxType.DZN,
    enumName: 'TaxType',
    enum: TaxType,
  })
  @IsEnum(TaxType)
  taxType: TaxType
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

  @ApiProperty({
    description: 'Type of tax',
    example: TaxType.DZN,
    enumName: 'TaxType',
    enum: TaxType,
  })
  @IsEnum(TaxType)
  taxType: TaxType
}

export class UnpaidTaxReminderBloomreachDataDto {
  @ApiProperty({
    description: 'year',
    example: 2024,
  })
  @IsDefined()
  @IsNumber()
  year: number

  @ApiProperty({
    description: 'Type of tax',
    example: TaxType.DZN,
    enumName: 'TaxType',
    enum: TaxType,
  })
  @IsEnum(TaxType)
  taxType: TaxType
}
