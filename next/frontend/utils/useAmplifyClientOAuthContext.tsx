'use client'

import { cityAccountClient } from '@clients/city-account'
import { Amplify } from 'aws-amplify'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { createContext, PropsWithChildren, useContext } from 'react'

import { environment } from '../../environment'
import { useOAuthParams } from '../hooks/useOAuthParams'
import logger from './logger'
import {
  clientIdQueryParam,
  payloadQueryParam,
  redirectUriQueryParam,
  stateQueryParam,
} from './queryParamRedirect'

const useGetContext = () => {
  const { clientId, payload, redirectUri, state } = useOAuthParams()

  // TODO OAuth: Discuss what should be considered as oauth login, now we check only if clientId exists in url params
  const isOAuthLogin = !!clientId

  const currentClientId = Amplify.getConfig().Auth?.Cognito.userPoolClientId

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
        { authStrategy: false },
      )
    } catch (error) {
      logger.error(`[AUTH] Error while storing tokens to BE: ${error}`)
    }
  }

  return {
    isOAuthLogin,
    currentClientId,
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
