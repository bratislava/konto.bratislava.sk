export interface CityAccountAdminUserDataResponseDto {
  birthNumber: string
  email: string
  externalId: string
  userAttribute: string
  cognitoAttributes: CognitoGetUserAttributesData
}

export enum CognitoUserAttributesTierEnum {
  NEW = 'NEW',
  QUEUE_IDENTITY_CARD = 'QUEUE_IDENTITY_CARD',
  NOT_VERIFIED_IDENTITY_CARD = 'NOT_VERIFIED_IDENTITY_CARD',
  IDENTITY_CARD = 'IDENTITY_CARD',
  EID = 'EID',
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

export interface CognitoGetUserAttributesData {
  sub?: string

  email_verified?: string

  'custom:tier'?: CognitoUserAttributesTierEnum

  given_name?: string

  family_name?: string

  email?: string

  idUser: string

  UserCreateDate: Date

  UserLastModifiedDate: Date

  Enabled: boolean

  UserStatus?: CognitoUserStatusEnum
}
