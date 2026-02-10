'use client'

import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { useRouter } from 'next/router'
import { ClientInfoResponseDto } from 'openapi-clients/city-account'
import { createContext, PropsWithChildren, useContext } from 'react'

import { cityAccountClient } from '@/clients/city-account'
import { environment } from '@/environment'

import { useOAuthParams } from '../hooks/useOAuthParams'
import { GENERIC_ERROR_MESSAGE } from './errors'
import logger from './logger'
import { authRequestIdQueryParam } from './queryParamRedirect'

export const useOAuthGetContext = (clientInfo: ClientInfoResponseDto | null) => {
  const { authRequestId, isIdentityVerificationRequired } = useOAuthParams()
  const router = useRouter()

  const isOAuthLogin = !!clientInfo

  // We cannot use GET request due to some cors policy issues. This workaround works, but there may also be a better solution.
  const getOAuthContinueUrl = () => {
    const parsedUrl = new URL(`${environment.cityAccountUrl}/oauth2/continue`)
    if (authRequestId) {
      parsedUrl.searchParams.set(authRequestIdQueryParam, authRequestId)
    }
    return parsedUrl
  }

  const handlePostOAuthTokens = async () => {
    logger.info(`[AUTH] Storing tokens to BE`)

    const { refreshToken } = (await cognitoUserPoolsTokenProvider.authTokenStore.loadTokens()) ?? {}

    if (!refreshToken || !authRequestId) {
      logger.error(`[AUTH] Missing refreshToken or authRequestId in handlePostOAuthTokens`)
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

  const storeTokensAndRedirect = async () => {
    await handlePostOAuthTokens()

    logger.info(`[AUTH] Calling Continue endpoint`)
    router
      .push(getOAuthContinueUrl())
      .catch(() => logger.error(`${GENERIC_ERROR_MESSAGE} redirect failed`))
  }

  const clientTitle = clientInfo?.clientName
    ? {
        DPB: 'DPB',
        PAAS_MPA: 'PAAS',
      }[clientInfo.clientName]
    : undefined

  return {
    isOAuthLogin,
    clientInfo,
    clientTitle,
    storeTokensAndRedirect,
    isIdentityVerificationRequired: !!isIdentityVerificationRequired,
  }
}

export const AmplifyClientOAuthContext = createContext<
  ReturnType<typeof useOAuthGetContext> | undefined
>(undefined)

// https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/#configure-amplify-library-for-client-side-usage
export const AmplifyClientOAuthProvider = ({
  clientInfo,
  children,
}: PropsWithChildren<{ clientInfo: ClientInfoResponseDto | null }>) => {
  const context = useOAuthGetContext(clientInfo)

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
