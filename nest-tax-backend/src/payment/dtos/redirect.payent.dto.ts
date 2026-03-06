import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TaxType } from '@prisma/client'
import { IsEnum, IsNumber, IsOptional } from 'class-validator'

export enum PaymentRedirectStateEnum {
  FAILED_TO_VERIFY = 'failed-to-verify',
  PAYMENT_ALREADY_PAID = 'payment-already-paid',
  PAYMENT_FAILED = 'payment-failed',
  PAYMENT_SUCCESS = 'payment-success',
}

export class PaymentRedirectResponseDto {
  @ApiProperty({
    description: 'Payment redirect status',
    example: PaymentRedirectStateEnum.PAYMENT_SUCCESS,
    enumName: 'PaymentRedirectStateEnum',
    enum: PaymentRedirectStateEnum,
  })
  @IsEnum(PaymentRedirectStateEnum)
  status: PaymentRedirectStateEnum

  @ApiPropertyOptional({
    description: 'Type of tax',
    example: TaxType.DZN,
    enumName: 'TaxType',
    enum: TaxType,
    required: false,
  })
  @IsEnum(TaxType)
  @IsOptional()
  taxType?: TaxType

  @ApiPropertyOptional({
    description: 'Year of the tax',
    example: 2024,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  year?: number

  @ApiPropertyOptional({
    description: 'Order of the tax',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number
}
