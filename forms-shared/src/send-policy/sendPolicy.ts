export enum FormSendPolicy {
  /**
   * Anyone can send the form.
   */
  NotAuthenticated,
  /**
   * User with an account can send the form.
   */
  AuthenticatedNotVerified,
  /**
   * User with a verified account can send the form.
   */
  AuthenticatedVerified,
  /**
   * User can send the form using eID or without the sign in.
   */
  EidOrNotAuthenticated,
  /**
   * User can send the form using eID or with an account.
   */
  EidOrAuthenticatedNotVerified,
  /**
   * User can send the form using eID or with a verified account.
   */
  EidOrAuthenticatedVerified,
  /**
   * Special case, the form can be sent only using eID and must be signed with "kvalifikovaný elektronický podpis" (KEP).
   */
  EidSigned,
}

const isSendPossible = (sendPolicy: FormSendPolicy) =>
  sendPolicy === FormSendPolicy.NotAuthenticated ||
  sendPolicy === FormSendPolicy.AuthenticatedNotVerified ||
  sendPolicy === FormSendPolicy.AuthenticatedVerified ||
  sendPolicy === FormSendPolicy.EidOrNotAuthenticated ||
  sendPolicy === FormSendPolicy.EidOrAuthenticatedNotVerified ||
  sendPolicy === FormSendPolicy.EidOrAuthenticatedVerified

const isEidSendPossible = (sendPolicy: FormSendPolicy) =>
  sendPolicy === FormSendPolicy.EidOrNotAuthenticated ||
  sendPolicy === FormSendPolicy.EidOrAuthenticatedNotVerified ||
  sendPolicy === FormSendPolicy.EidOrAuthenticatedVerified ||
  sendPolicy === FormSendPolicy.EidSigned

export enum SendPolicyAccountType {
  NotAuthenticated,
  AuthenticatedNotVerified,
  AuthenticatedVerified,
}

const sendPolicyLevelMap = {
  [FormSendPolicy.NotAuthenticated]: 0,
  [FormSendPolicy.EidOrNotAuthenticated]: 0,
  [FormSendPolicy.AuthenticatedNotVerified]: 1,
  [FormSendPolicy.EidOrAuthenticatedNotVerified]: 1,
  [FormSendPolicy.AuthenticatedVerified]: 2,
  [FormSendPolicy.EidOrAuthenticatedVerified]: 2,
}

const accountTypeLevelMap = {
  [SendPolicyAccountType.NotAuthenticated]: 0,
  [SendPolicyAccountType.AuthenticatedNotVerified]: 1,
  [SendPolicyAccountType.AuthenticatedVerified]: 2,
}

export enum SendAllowedForUserResult {
  NotPossible,
  AuthenticationMissing,
  VerificationMissing,
  AuthenticationAndVerificationMissing,
  Allowed,
}

const isSendAllowedForUser = (sendPolicy: FormSendPolicy, accountType: SendPolicyAccountType) => {
  if (!isSendPossible(sendPolicy)) {
    return SendAllowedForUserResult.NotPossible
  }

  const sendPolicyLevel = sendPolicyLevelMap[sendPolicy]
  const accountTypeLevel = accountTypeLevelMap[accountType]

  if (sendPolicyLevel <= accountTypeLevel) {
    return SendAllowedForUserResult.Allowed
  }

  if (sendPolicyLevel === 2 && accountTypeLevel === 0) {
    return SendAllowedForUserResult.AuthenticationAndVerificationMissing
  }

  if (accountTypeLevel === 0) {
    return SendAllowedForUserResult.AuthenticationMissing
  }

  if (accountTypeLevel === 1) {
    return SendAllowedForUserResult.VerificationMissing
  }

  throw new Error('Unsuppported branch.')
}

/**
 * Returns evaluated send policy for a specific user.
 *
 * The difference between possible and allowed:
 *  - possible: the form can be sent via the specified method, but the user might or might not be to use it at the moment
 *  - allowed for user: whether the user can send the form using the specified method based on his account type
 *
 *  The purpose of this function is to have a centralized policy evaluation that is used both by:
 *  - Forms BE, e.g. to reject/accept the incoming send requests
 *  - Frontend app, e.g. to display respective send buttons, explain the user some action is required (therefore the
 *    reason is provided)
 */
export const evaluateFormSendPolicy = (
  sendPolicy: FormSendPolicy,
  accountType: SendPolicyAccountType,
) => {
  const sendAllowedForUserResult = isSendAllowedForUser(sendPolicy, accountType)

  return {
    send: {
      possible: isSendPossible(sendPolicy),
      allowedForUser: sendAllowedForUserResult === SendAllowedForUserResult.Allowed,
      allowedForUserResult: sendAllowedForUserResult,
    },
    eidSend: {
      possible: isEidSendPossible(sendPolicy),
    },
  }
}
