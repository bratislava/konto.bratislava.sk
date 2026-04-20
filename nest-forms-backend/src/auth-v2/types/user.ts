import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model'

import { CityAccountUser } from '../services/city-account-user.service'
import { CognitoUser } from '../services/cognito-user.service'

export enum UserType {
  Guest = 'Guest',
  Auth = 'Auth',
}

export interface GuestUser {
  type: UserType.Guest
  cognitoIdentityId: string
}

export interface AuthUser {
  type: UserType.Auth
  cognitoJwtPayload: CognitoAccessTokenPayload
  cognitoUser: CognitoUser
  cityAccountUser: CityAccountUser
}

export type User = GuestUser | AuthUser

export const isGuestUser = (user: User): user is GuestUser =>
  user.type === UserType.Guest

export const isAuthUser = (user: User): user is AuthUser =>
  user.type === UserType.Auth
