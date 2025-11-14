import type { LibraryOptions } from '@aws-amplify/core'
import type { ResourcesConfig } from 'aws-amplify'
import { environment } from 'environment'

export const amplifyConfig = {
  Auth: {
    Cognito: {
      //  Amazon Cognito User Pool ID
      userPoolId: environment.cognitoUserPoolId,
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolClientId: environment.cognitoClientId,
      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      identityPoolId: environment.cognitoIdentityPoolId,
      // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
      // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
      signUpVerificationMethod: 'code', // 'code' | 'link'
      // `Guest access` must be enabled in `Identity pools` in Amplify Console, otherwise the whole application will
      // stop working.
      allowGuestAccess: true,
    },
  },
} satisfies ResourcesConfig

export const createAmplifyConfig = ({ clientId }: { clientId?: string }): ResourcesConfig => {
  return {
    Auth: {
      Cognito: {
        ...amplifyConfig.Auth.Cognito,
        ...(clientId && { userPoolClientId: clientId }),
      },
    },
  }
}

export const amplifyLibraryOptions: LibraryOptions = {
  ssr: true,
}
