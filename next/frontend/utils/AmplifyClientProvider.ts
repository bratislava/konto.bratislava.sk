'use client'

import { Amplify } from 'aws-amplify'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { CookieStorage, sessionStorage } from 'aws-amplify/utils'
import { PropsWithChildren, useCallback } from 'react'

import { useOAuthParams } from '../hooks/useOAuthParams'
import { amplifyConfig, amplifyLibraryOptions, createAmplifyConfig } from './amplifyConfig'

Amplify.configure(amplifyConfig, amplifyLibraryOptions)

export const useAmplifyConfigureByClientId = () => {
  const { clientId } = useOAuthParams()

  const isOAuthLogin = !!clientId

  const amplifyConfigureByClientId = useCallback(() => {
    if (isOAuthLogin) {
      Amplify.configure(createAmplifyConfig({ clientId }), amplifyLibraryOptions)
      cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage) // Session storage - for oauth flow
    } else {
      Amplify.configure(amplifyConfig, amplifyLibraryOptions)
      // Setting cookie storage based on default setting, see https://github.com/aws-amplify/amplify-js/blob/%40aws-amplify/adapter-nextjs%401.6.8/packages/aws-amplify/src/initSingleton.ts#L41
      cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage({ sameSite: 'lax' })) // Cookies - default for SSR
    }

    const currentConfig = Amplify.getConfig()

    return currentConfig.Auth?.Cognito.userPoolClientId
  }, [clientId, isOAuthLogin])

  return {
    isOAuthLogin,
    amplifyConfigureByClientId,
  }
}

// https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/#configure-amplify-library-for-client-side-usage
export default function AmplifyClientProvider({ children }: PropsWithChildren) {
  return children
}
