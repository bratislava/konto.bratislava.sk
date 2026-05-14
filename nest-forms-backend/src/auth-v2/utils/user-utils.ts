import { FormOwnerType } from '@prisma/client'
import {
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesTierEnum,
} from 'openapi-clients/city-account'

import { AuthUser, isAuthUser, User } from '../types/user'

const tierVerifiedMap = {
  [CognitoUserAttributesTierEnum.Eid]: true,
  [CognitoUserAttributesTierEnum.IdentityCard]: true,
  [CognitoUserAttributesTierEnum.NotVerifiedIdentityCard]: false,
  [CognitoUserAttributesTierEnum.QueueIdentityCard]: false,
  [CognitoUserAttributesTierEnum.New]: false,
} satisfies Record<CognitoUserAttributesTierEnum, boolean>

export function isUserVerified(user: AuthUser) {
  const tier = user.cognitoUser.userAttributes['custom:tier']
  if (!tier) {
    return false
  }

  return tierVerifiedMap[tier]
}

const userFormOwnerTypeMap = {
  [CognitoUserAccountTypesEnum.Fo]: FormOwnerType.FO,
  [CognitoUserAccountTypesEnum.Po]: FormOwnerType.PO,
  [CognitoUserAccountTypesEnum.FoP]: FormOwnerType.PO,
} satisfies Record<CognitoUserAccountTypesEnum, FormOwnerType>

export function userToFormOwnerType(user: User) {
  if (!isAuthUser(user)) {
    return null
  }

  const accountType = user.cognitoUser.userAttributes['custom:account_type']
  return userFormOwnerTypeMap[accountType]
}

export function getUserIco(user: User) {
  if (!isAuthUser(user)) {
    return null
  }

  if ('ico' in user.cityAccountUser) {
    return user.cityAccountUser.ico
  }

  return null
}
