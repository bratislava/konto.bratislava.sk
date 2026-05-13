import { ApiProperty } from '@nestjs/swagger'
import { ConsentEnum, DeliveryMethodUserPreferenceEnum, LoginClientEnum } from '@prisma/client'
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

export class UpdateGdprConsentRequestDto {
  @ApiProperty({
    description: 'The consent the user is toggling',
    enum: ConsentEnum,
    example: ConsentEnum.MARKETING,
  })
  @IsEnum(ConsentEnum)
  consentType!: ConsentEnum

  @ApiProperty({
    description: 'True to accept the consent, false to revoke it',
    example: true,
  })
  @IsBoolean()
  grant!: boolean
}

export class SetDeliveryMethodRequestDto {
  @ApiProperty({
    description: 'Preferred delivery method for tax / official communication',
    enum: DeliveryMethodUserPreferenceEnum,
    example: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
  })
  @IsEnum(DeliveryMethodUserPreferenceEnum)
  deliveryMethod!: DeliveryMethodUserPreferenceEnum
}
