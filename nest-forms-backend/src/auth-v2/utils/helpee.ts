import { UserVerifyStateCognitoTierEnum } from 'openapi-clients/city-account'

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

  const tier = user.cognitoAttributes.userAttributes['custom:tier']
  return tierVerifiedMap[tier]
}
