'use client'

import { cityAccountClient, LoginClientEnum } from '@clients/city-account'
import { Amplify } from 'aws-amplify'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { createContext, PropsWithChildren, useContext } from 'react'

import { environment } from '../../environment'
import { useOAuthParams } from '../hooks/useOAuthParams'
import { clearOAuthSessionStorage } from './amplifyClient'
import logger from './logger'
import {
  authRequestIdQueryParam
} from './queryParamRedirect'

export const getOAuthClientInfo = (clientId: string) =>
  (
    ({
      '3ei88tn1gkvhfqpfckkd6plopr': {
        name: 'PAAS_MPA',
        title: 'PAAS',
      },
      '536t828sp4o7gsn3cmg3fbks5i': {
        name: 'DPB',
        title: 'start.dpb.sk',
      },
    }) satisfies Record<string, { name: LoginClientEnum; title: string }>
  )[clientId] ?? null

const useGetContext = () => {
  const { isOAuth, authRequestId } = useOAuthParams()

  const isOAuthLogin = isOAuth

  const currentClientId = Amplify.getConfig().Auth?.Cognito.userPoolClientId

  const clientInfo = currentClientId ? getOAuthClientInfo(currentClientId) : null

  // TODO OAuth: We cannot use GET request due to some cors policy issues. This workaround works, but there may also be a better solution.
  const getOAuthContinueUrl = () => {
    const parsedUrl = new URL(`${environment.cityAccountUrl}/oauth2/continue`)
    if (authRequestId) {
      parsedUrl.searchParams.set(authRequestIdQueryParam, authRequestId)
    }
    return parsedUrl
  }

  const handlePostOAuthTokens = async () => {
    const { refreshToken } =
      (await cognitoUserPoolsTokenProvider.authTokenStore.loadTokens()) ?? {}

    if (!refreshToken || !authRequestId) {
      logger.error(
        `[AUTH] Missing access_token or refreshToken or authRequestId in handlePostOAuthTokens`,
      )
      // TODO OAuth: handle error
      return
    }

    try {
      await cityAccountClient.oAuth2ControllerStoreTokens(
        {
          refreshToken,
          authRequestId,
        },
        { authStrategy: false },
      )
    } catch (error) {
      logger.error(`[AUTH] Error while storing tokens to BE: ${error}`)
    }
  }

  const handleOAuthLogin = async () => {
    logger.info(`[AUTH] Storing tokens to BE`)
    await handlePostOAuthTokens()

    logger.info(`[AUTH] Calling userControllerUpsertUserAndRecordClient`)
    // In order to ensure every user is in City Account BE database it's good to do this on each successful sign-in,
    // there might be some cases where user is not there yet.
    await cityAccountClient.userControllerUpsertUserAndRecordClient(
      // TODO OAuth: Handle missing clientInfo.name
      { loginClient: clientInfo?.name ?? LoginClientEnum.CityAccount },
      { authStrategy: 'authOnly' },
    )

    logger.info(`[AUTH] Clearing session`)
    clearOAuthSessionStorage()
  }

  return {
    isOAuthLogin,
    currentClientId,
    clientInfo,
    getOAuthContinueUrl,
    handleOAuthLogin,
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
