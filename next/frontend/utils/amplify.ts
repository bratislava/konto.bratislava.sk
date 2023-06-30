import { Amplify, Auth } from 'aws-amplify'
import { ROUTES } from 'frontend/api/constants'

import logger from './logger'

// TODO once env handling is merged update not to use process.env directly
Amplify.configure({
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,

    // REQUIRED - Amazon Cognito Region
    region: process.env.NEXT_PUBLIC_AWS_REGION,

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,

    // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
    // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
    signUpVerificationMethod: 'code',
  },
  ssr: true,
})

// TODO continue here clear status
export enum AccountStatus {
  Idle,
  NewPasswordRequired,
  NewPasswordSuccess,
  EmailVerificationRequired,
  EmailVerificationSuccess,
  IdentityVerificationRequired,
  IdentityVerificationPending,
  IdentityVerificationFailed,
  IdentityVerificationSuccess,
}

// TODO - could be better, currently used only after login, AccountStatus should be replaced or rewritten
export const mapTierToStatus = (tier?: Tier): AccountStatus => {
  switch (tier) {
    case Tier.QUEUE_IDENTITY_CARD:
      return AccountStatus.IdentityVerificationPending
    case Tier.NOT_VERIFIED_IDENTITY_CARD:
      return AccountStatus.IdentityVerificationFailed
    case Tier.IDENTITY_CARD:
    case Tier.EID:
      return AccountStatus.IdentityVerificationSuccess
    case Tier.NEW:
      return AccountStatus.Idle
    default:
      return AccountStatus.IdentityVerificationRequired
  }
}

export const getAccessTokenOrLogout = async () => {
  try {
    const session = await Auth.currentSession()
    const jwtToken = session.getAccessToken().getJwtToken()
    if (!jwtToken) throw new Error('no jwt token found in current session')
    return jwtToken
  } catch (error) {
    logger.error('error getting access token - redirect to login', error)
    window.location.assign(ROUTES.LOGIN)
    throw error
  }
}
