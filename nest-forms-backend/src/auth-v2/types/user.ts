import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model'
import { UserControllerGetOrCreateUser200Response } from 'openapi-clients/city-account'

import { CognitoUser } from '../services/cognito-user.service'

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
  cognitoJwtPayload: CognitoAccessTokenPayload
  cognitoUser: CognitoUser
  cityAccountUser: UserControllerGetOrCreateUser200Response
}

export type User = GuestUser | AuthUser

export const isGuestUser = (user: User): user is GuestUser =>
  user.type === UserType.Guest

export const isAuthUser = (user: User): user is AuthUser =>
  user.type === UserType.Auth
