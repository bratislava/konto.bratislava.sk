import { AdminGetUserCommandOutput } from '@aws-sdk/client-cognito-identity-provider'
import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model'
import { UserControllerGetOrCreateUser200Response } from 'openapi-clients/city-account'

export enum UserType {
  Guest = 'Guest',
  Auth = 'Auth',
}

export type GuestUser = {
  type: UserType.Guest
  cognitoIdentityId: string
}

export type AuthUser = {
  type: UserType.Auth
  cognitoPayload: CognitoAccessTokenPayload
  cognitoAttributes: AdminGetUserCommandOutput
  cityAccountUser: UserControllerGetOrCreateUser200Response
}

export type User = GuestUser | AuthUser
