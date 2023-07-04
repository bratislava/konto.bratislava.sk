import { Amplify, Auth } from 'aws-amplify'
import { environment } from 'environment'
import { ROUTES } from 'frontend/api/constants'

import logger from './logger'

// TODO once env handling is merged update not to use process.env directly
Amplify.configure({
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: environment.cognitoIdentityPoolId,

    // REQUIRED - Amazon Cognito Region
    region: environment.awsRegion,

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: environment.cognitoUserPoolId,

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: environment.cognitoClientId,

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,

    // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
    // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
    signUpVerificationMethod: 'code',
  },
  ssr: true,
})

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
