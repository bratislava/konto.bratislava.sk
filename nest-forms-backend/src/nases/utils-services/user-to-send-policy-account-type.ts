import { SendPolicyAccountType } from 'forms-shared/send-policy/sendPolicy'

import { CognitoGetUserData } from '../../auth/dtos/cognito.dto'
import { Tier } from '../../utils/global-enums/city-account.enum'

export default function userToSendPolicyAccountType(
  user?: CognitoGetUserData,
): SendPolicyAccountType {
  if (!user?.idUser) {
    return SendPolicyAccountType.NotAuthenticated
  }

  if (
    user['custom:tier'] === Tier.IDENTITY_CARD ||
    user['custom:tier'] === Tier.EID
  ) {
    return SendPolicyAccountType.AuthenticatedVerified
  }

  return SendPolicyAccountType.AuthenticatedNotVerified
}
