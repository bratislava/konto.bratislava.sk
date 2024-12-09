import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CognitoUserAttributesTierEnum } from '@prisma/client'
import { IsString } from 'class-validator'

export class CognitoUserAttributesValuesDateDto {
  Name!: CognitoUserAttributesEnum

  Value!: string | CognitoUserAttributesTierEnum
}

export enum CognitoUserAccountTypesEnum {
  PHYSICAL_ENTITY = 'fo', // fyzicka osoba
  LEGAL_ENTITY = 'po', // pravnicka osoba
  SELF_EMPLOYED_ENTITY = 'fo-p', // fyzicka osoba - podnikatel
}

export enum CognitoUserAttributesEnum {
  TIER = 'custom:tier',
  BIRTH_NUMBER = 'custom:birthNumber',
  RC_OP_VERIFIED_DATE = 'custom:rc_op_verified_date',
  IFO = 'custom:ifo',
  ACCOUNT_TYPE = 'custom:account_type',
}

export enum CognitoUserStatusEnum {
  ARCHIVED = 'ARCHIVED',
  COMPROMISED = 'COMPROMISED',
  CONFIRMED = 'CONFIRMED',
  FORCE_CHANGE_PASSWORD = 'FORCE_CHANGE_PASSWORD',
  RESET_REQUIRED = 'RESET_REQUIRED',
  UNCONFIRMED = 'UNCONFIRMED',
  UNKNOWN = 'UNKNOWN',
}

export class CognitoGetUserAttributesData {
  @ApiProperty({
    description: 'Id from cognito',
    default: '9e7791b2-787b-4b93-8473-94a70a516025',
  })
  sub!: string

  @ApiProperty({
    description: 'Is email verified in cognito?',
    default: 'true',
  })
  email_verified?: string

  @ApiPropertyOptional({
    description: 'Usually name of the company',
    example: 'Company s.r.o.',
  })
  @IsString()
  name?: string

  @ApiProperty({
    description: 'Which type of verified tier it is?',
    default: CognitoUserAttributesTierEnum.IDENTITY_CARD,
  })
  'custom:tier'?: CognitoUserAttributesTierEnum

  @ApiProperty({
    description: 'Which type of account it is?',
    default: CognitoUserAccountTypesEnum.PHYSICAL_ENTITY,
  })
  'custom:account_type'!: CognitoUserAccountTypesEnum

  @ApiProperty({
    description: 'First name',
    default: 'Jožko',
  })
  given_name?: string

  @ApiProperty({
    description: 'Last name',
    default: 'Bratislavský',
  })
  family_name?: string

  @ApiProperty({
    description: 'email',
    default: 'janko.bratislavsky@bratislava.sk',
  })
  email: string
}

export class CognitoGetUserData extends CognitoGetUserAttributesData {
  @ApiProperty({
    description: 'User Id from cognito, same as sub',
    default: '9e7791b2-787b-4b93-8473-94a70a516025',
  })
  idUser!: string

  @ApiProperty({
    description: 'User create date',
    default: '2022-01-01 00:00:00',
  })
  UserCreateDate?: Date

  @ApiProperty({
    description: 'User updated date',
    default: '2022-01-01 00:00:00',
  })
  UserLastModifiedDate?: Date

  @ApiProperty({
    description: 'Is user enabled?',
    default: true,
  })
  Enabled!: boolean

  @ApiProperty({
    description: 'Cognito confirmation statue',
    default: CognitoUserStatusEnum.CONFIRMED,
  })
  UserStatus?: CognitoUserStatusEnum
}

export interface CognitoUserAttributesDto {
  Name: string
  Value?: string
}

export interface CognitoAccessTokenDto {
  sub: string
  device_key: string
  iss: string
  client_id: string
  origin_jti: string
  event_id: string
  token_use: CognitoTokenType
  scope: string
  auth_time: number
  exp: number
  iat: number
  jti: string
  username: string
}

enum CognitoTokenType {
  ID = 'id',
  ACCESS = 'access',
}
