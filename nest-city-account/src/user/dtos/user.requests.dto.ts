import { ApiProperty } from '@nestjs/swagger'
import { DeliveryMethodUserEnum, LoginClientEnum } from '@prisma/client'
import { IsBoolean, IsEnum } from 'class-validator'

export class UpsertUserRecordClientRequestDto {
  @ApiProperty({
    description: 'Client that the user logged in through',
    enum: LoginClientEnum,
    example: LoginClientEnum.CITY_ACCOUNT,
  })
  @IsEnum(LoginClientEnum)
  loginClient!: LoginClientEnum
}

// TODO decide final enum — likely replaces the (category, type) tuple with a single user-facing consent key.
export enum UserConsentTypeEnum {
  MARKETING = 'MARKETING',
}

export class UpdateGdprConsentRequestDto {
  @ApiProperty({
    description: 'The consent the user is toggling',
    enum: UserConsentTypeEnum,
    example: UserConsentTypeEnum.MARKETING,
  })
  @IsEnum(UserConsentTypeEnum)
  consentType!: UserConsentTypeEnum

  @ApiProperty({
    description: 'True to accept the consent, false to revoke it',
    example: true,
  })
  @IsBoolean()
  accept!: boolean
}

export class SetDeliveryMethodRequestDto {
  @ApiProperty({
    description: 'Preferred delivery method for tax / official communication',
    enum: DeliveryMethodUserEnum,
    example: DeliveryMethodUserEnum.CITY_ACCOUNT,
  })
  @IsEnum(DeliveryMethodUserEnum)
  deliveryMethod!: DeliveryMethodUserEnum
}