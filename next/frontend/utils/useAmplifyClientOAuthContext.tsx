'use client'

import { Amplify } from 'aws-amplify'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { CookieStorage, sessionStorage } from 'aws-amplify/utils'
import { createContext, PropsWithChildren, useCallback, useContext } from 'react'

import { useOAuthParams } from '../hooks/useOAuthParams'
import { amplifyConfig, amplifyLibraryOptions, createAmplifyConfig } from './amplifyConfig'

const useGetContext = () => {
  const { clientId } = useOAuthParams()

  // TODO OAuth: Discuss what should be considered as oauth login, now we check only if clientId exists in url params
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

export const AmplifyClientOAuthContext = createContext<
  ReturnType<typeof useGetContext> | undefined
>(undefined)

// https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/#configure-amplify-library-for-client-side-usage
export const AmplifyClientOAuthProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return (
    <AmplifyClientOAuthContext.Provider value={context}>
      {children}
    </AmplifyClientOAuthContext.Provider>
  )
}

export const useAmplifyClientOAuthContext = () => {
  const context = useContext(AmplifyClientOAuthContext)
  if (!context) {
    throw new Error('useAmplifyClientOauthContext must be used within a AmplifyClientOAuthProvider')
  }

  return context
}
