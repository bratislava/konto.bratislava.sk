import { FormOwnerType } from '@prisma/client'
import {
  UserVerifyStateCognitoTierEnum,
  UserVerifyStateTypeEnum,
} from 'openapi-clients/city-account'

import { isAuthUser, User } from '../types/user'

const tierVerifiedMap = {
  [UserVerifyStateCognitoTierEnum.Eid]: true,
  [UserVerifyStateCognitoTierEnum.IdentityCard]: true,
  [UserVerifyStateCognitoTierEnum.NotVerifiedIdentityCard]: false,
  [UserVerifyStateCognitoTierEnum.QueueIdentityCard]: false,
  [UserVerifyStateCognitoTierEnum.New]: false,
} satisfies Record<UserVerifyStateCognitoTierEnum, boolean>

export function isUserVerified(user: User) {
  if (!isAuthUser(user)) {
    return false
  }

  const tier = user.cognitoUser.userAttributes['custom:tier']
  if (!tier) {
    return false
  }

  return tierVerifiedMap[tier]
}

const userFormOwnerTypeMap = {
  [UserVerifyStateTypeEnum.Fo]: FormOwnerType.FO,
  [UserVerifyStateTypeEnum.Po]: FormOwnerType.PO,
  [UserVerifyStateTypeEnum.FoP]: FormOwnerType.PO,
} satisfies Record<UserVerifyStateTypeEnum, FormOwnerType>

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
