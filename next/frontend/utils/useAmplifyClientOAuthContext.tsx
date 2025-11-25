'use client'

import { cityAccountClient } from '@clients/city-account'
import { Amplify } from 'aws-amplify'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { CookieStorage, sessionStorage } from 'aws-amplify/utils'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { environment } from '../../environment'
import { useOAuthParams } from '../hooks/useOAuthParams'
import { clearOAuthSessionStorage } from './amplifyClient'
import { amplifyConfig, amplifyLibraryOptions, createAmplifyConfig } from './amplifyConfig'
import logger from './logger'
import {
  clientIdQueryParam,
  payloadQueryParam,
  redirectUriQueryParam,
  stateQueryParam,
} from './queryParamRedirect'

const useGetContext = () => {
  const { clientId, payload, redirectUri, state } = useOAuthParams()

  const [currentClientId, setCurrentClientId] = useState<string | null>(null)

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

  useEffect(() => {
    const userPoolClientId = amplifyConfigureByClientId()
    setCurrentClientId(userPoolClientId || null)

    clearOAuthSessionStorage()
  }, [amplifyConfigureByClientId])

  // TODO OAuth: client info endpoint
  // const getClientInfo = useCallback(async () => {
  //   const { data: clientInfo } = await cityAccountClient.oAuth2ControllerInfo(
  //     payload ?? '',
  //     clientId ?? undefined,
  //     redirectUri ?? undefined,
  //     state ?? undefined,
  //   )
  //
  //   return clientInfo
  // }, [clientId, payload, redirectUri, state])

  const getOAuthContinueUrl = () => {
    const parsedUrl = new URL(`${environment.cityAccountUrl}/oauth2/continue`)
    if (payload) {
      parsedUrl.searchParams.set(payloadQueryParam, payload)
    }
    if (clientId) {
      parsedUrl.searchParams.set(clientIdQueryParam, clientId)
    }
    if (redirectUri) {
      parsedUrl.searchParams.set(redirectUriQueryParam, redirectUri)
    }
    if (state) {
      parsedUrl.searchParams.set(stateQueryParam, state)
    }
    return parsedUrl
  }

  const handlePostOAuthTokens = async () => {
    const { accessToken, idToken, refreshToken } =
      (await cognitoUserPoolsTokenProvider.authTokenStore.loadTokens()) ?? {}

    const access_token = accessToken?.toString()
    const id_token = idToken?.toString()
    const refresh_token = refreshToken
    // TODO OAuth remove tokens from logger
    logger.info(`[AUTH] Storing tokens to BE`)

    if (!access_token || !refresh_token || !payload) {
      logger.error(
        `[AUTH] Missing access_token or refresh_token or payload in handlePostOAuthTokens`,
      )
      // TODO OAuth: handle error
      return
    }

    try {
      await cityAccountClient.oAuth2ControllerStoreTokens(
        {
          access_token,
          id_token,
          refresh_token,
          payload,
          client_id: clientId ?? undefined,
          redirect_uri: redirectUri ?? undefined,
          state: state ?? undefined,
        },
        // TODO OAuth: revisit and check if this is what we wanted
        { authStrategy: false },
      )
    } catch (error) {
      logger.error(`[AUTH] Error while storing tokens to BE: ${error}`)
    }
  }

  return {
    isOAuthLogin,
    currentClientId,
    amplifyConfigureByClientId,
    handlePostOAuthTokens,
    getOAuthContinueUrl,
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
