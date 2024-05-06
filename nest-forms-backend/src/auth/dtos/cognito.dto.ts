export class CognitoGetUserAttributesData {
  declare sub: string

  email_verified?: string

  'custom:tier'?: string

  'custom:account_type'?: string

  email?: string

  given_name?: string

  family_name?: string
}

export class CognitoGetUserData extends CognitoGetUserAttributesData {
  declare idUser: string

  UserCreateDate?: Date

  UserLastModifiedDate?: Date

  Enabled?: boolean

  UserStatus?: string
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
