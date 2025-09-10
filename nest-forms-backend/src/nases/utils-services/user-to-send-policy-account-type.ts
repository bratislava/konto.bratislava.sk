import { SendPolicyAccountType } from 'forms-shared/send-policy/sendPolicy'

import { isAuthUser, isGuestUser, User } from '../../auth-v2/types/user'
import { isUserVerified } from '../../auth-v2/utils/user-utils'

export default function userToSendPolicyAccountType(user: User) {
  if (isGuestUser(user)) {
    return SendPolicyAccountType.NotAuthenticated
  }

  if (isAuthUser(user)) {
    return isUserVerified(user)
      ? SendPolicyAccountType.AuthenticatedVerified
      : SendPolicyAccountType.AuthenticatedNotVerified
  }

  throw new Error('Unexpected error when converting user to send policy.')
}
