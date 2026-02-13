import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserAttributeEnum } from '../../user/dtos/gdpr.user.dto'
import { CognitoUserAttributesTierEnum, DeliveryMethodEnum } from '@prisma/client'
import { CognitoGetUserData } from '../../utils/global-dtos/cognito.dto'
import { IsArray, IsDate, IsEnum, IsObject, IsString } from 'class-validator'
import { IsBirthNumber } from '../../utils/decorators/validation.decorators'
import { Type } from 'class-transformer'

export class ResponseUserByBirthNumberDto {
  @ApiProperty({
    description: 'userBirthNumber',
    default: '8808080000',
  })
  birthNumber!: string | null

  @ApiProperty({
    description: 'email',
    default: 'brtaislavcan@bratislava.sk',
  })
  email!: string | null

  @ApiProperty({
    description: 'Cognito Id',
    default: 'd18cbd7c-daad-4d5d-a1d7-8e47f845baab',
  })
  externalId!: string | null

  @ApiProperty({
    description: 'Special user attribute for user segmentation',
    default: UserAttributeEnum.TAX2023,
  })
  userAttribute: string | UserAttributeEnum | null

  @ApiProperty({
    description: 'Tier from cognito',
    default: CognitoUserAttributesTierEnum.IDENTITY_CARD,
  })
  // eslint-disable-next-line @typescript-eslint/ban-types
  cognitoAttributes?: CognitoGetUserData | {}

  @ApiPropertyOptional({
    description: 'Delivery method for tax documents at lock date',
    example: DeliveryMethodEnum.EDESK,
    enum: DeliveryMethodEnum,
  })
  @IsEnum(DeliveryMethodEnum)
  taxDeliveryMethodAtLockDate: DeliveryMethodEnum | null
}

export class GetUserDataByBirthNumbersBatchResponseDto {
  @ApiProperty({
    description: 'A record of users keyed by their birth number',
    type: 'object',
    additionalProperties: { type: 'ResponseUserByBirthNumberDto' },
  })
  @IsObject()
  users: Record<string, ResponseUserByBirthNumberDto>
}

export class GetNewVerifiedUsersBirthNumbersResponseDto {
  @ApiProperty({
    description: 'List of birth numbers',
    type: String,
    isArray: true,
    example: ['0123456789', '1234567890', '234567890'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsBirthNumber({ each: true })
  birthNumbers: string[]

  @ApiProperty({
    description: 'Next date to query.',
    example: '2023-04-13T14:39:49.004Z',
    format: 'date-time',
    type: 'string',
  })
  @IsDate()
  @Type(() => Date)
  nextSince: Date
}
