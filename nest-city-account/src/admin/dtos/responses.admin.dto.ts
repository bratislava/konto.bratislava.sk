import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CognitoUserAttributesTierEnum, DeliveryMethodEnum } from '@prisma/client'
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsObject, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { UserAttributeEnum } from '../../user/dtos/gdpr.user.dto'
import { IsBirthNumber } from '../../utils/decorators/validation.decorators'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
} from '../../utils/global-dtos/cognito.dto'

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

export class UserVerifyState {
  @ApiPropertyOptional({
    description: "Id of given user's email, if exists",
  })
  externalId?: string | null

  @ApiPropertyOptional({
    description: 'Type of user.',
    example: CognitoUserAccountTypesEnum.LEGAL_ENTITY,
    enum: CognitoUserAccountTypesEnum,
  })
  @IsEnum(CognitoUserAccountTypesEnum)
  type?: CognitoUserAccountTypesEnum

  @ApiProperty({
    description: 'Marks if the user with given email is in database.',
    example: true,
  })
  @IsBoolean()
  isInDatabase!: boolean

  @ApiProperty({
    description: 'Marks if the user with given email is in cognito.',
    example: true,
  })
  @IsBoolean()
  isInCognito!: boolean

  @ApiProperty({
    description: 'Current cognito tier, marks the status of verifying.',
    example: CognitoUserAttributesTierEnum.NOT_VERIFIED_IDENTITY_CARD,
    enum: CognitoUserAttributesTierEnum,
  })
  @IsEnum(CognitoUserAttributesTierEnum)
  cognitoTier?: CognitoUserAttributesTierEnum

  @ApiProperty({
    description:
      'If set, then this number was used for verifiying, but is already in our database for other user.',
    example: '7902301011',
  })
  @IsString()
  birthNumberAlreadyExists?: string

  @ApiProperty({
    description:
      'If set, then this number was used for verifiying, but is already in our database for other user.',
    example: '7902301011',
  })
  @IsString()
  birthNumberIcoAlreadyExists?: string

  @ApiProperty({
    description: 'Marks if the user with given email is verified.',
    example: false,
  })
  @IsBoolean()
  isVerified!: boolean

  @ApiPropertyOptional({
    description: 'Possible cause of the verify error.',
    example: 'TODO',
  })
  @IsString()
  possibleCause?: string
}

export class OnlySuccessDto {
  @ApiProperty({
    description: 'Marks if the operation has been successful',
    example: true,
  })
  @IsBoolean()
  success!: boolean
}

export class ValidatedUsersToPhysicalEntitiesResponseDto {
  @IsNumber()
  existingPhysicalEntitiesUpdated!: number

  @IsNumber()
  newPhysicalEntitiesCreated!: number
}

export class ValidateEdeskForUserIdsResponseDto {
  @ApiProperty({
    description: 'Number of users that were validated',
    example: 1,
  })
  @IsNumber()
  validatedUsers!: number

  @ApiProperty({
    description: 'Temp debug data',
    example: null,
  })
  //TODO: add types
  enitites: unknown
}

export class ResponseValidatePhysicalEntityRfoDto {
  @ApiProperty({
    description: 'Entity data (updated if new info was found in state registry)',
    example: {},
  })
  //TODO: add types
  physicalEntity: unknown

  @ApiProperty({
    description: 'Data received from RFO',
    example: {},
  })
  //TODO: add types
  rfoData: unknown

  @ApiProperty({
    description: 'Data received from UPVS',
    example: {},
  })
  //TODO: add types
  upvsResult: unknown
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
