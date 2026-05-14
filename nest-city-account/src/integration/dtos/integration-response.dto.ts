import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CognitoUserAttributesTierEnum, DeliveryMethodEnum } from '@prisma/client'
import { Type } from 'class-transformer'

import { UserAttributeEnum } from '../../user/dtos/gdpr.user.dto'
import { CognitoGetUserData } from '../../utils/global-dtos/cognito.dto'

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

  @ApiPropertyOptional({
    description: 'Tier from cognito',
    default: CognitoUserAttributesTierEnum.IDENTITY_CARD,
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  cognitoAttributes?: CognitoGetUserData | {}

  @ApiPropertyOptional({
    description: 'Delivery method for tax documents at lock date',
    example: DeliveryMethodEnum.EDESK,
    enum: DeliveryMethodEnum,
  })
  taxDeliveryMethodAtLockDate?: DeliveryMethodEnum | null
}

export class GetUserDataByBirthNumbersBatchResponseDto {
  @ApiProperty({
    description: 'A record of users keyed by their birth number',
    type: 'object',
    additionalProperties: { type: 'ResponseUserByBirthNumberDto' },
  })
  users: Record<string, ResponseUserByBirthNumberDto>
}

export class GetNewVerifiedUsersBirthNumbersResponseDto {
  @ApiProperty({
    description: 'List of birth numbers',
    type: String,
    isArray: true,
    example: ['0123456789', '1234567890', '234567890'],
  })
  birthNumbers: string[]

  @ApiProperty({
    description: 'Next date to query.',
    example: '2023-04-13T14:39:49.004Z',
    format: 'date-time',
    type: 'string',
  })
  @Type(() => Date)
  nextSince: Date
}
