// eslint-disable-next-line import/no-extraneous-dependencies
import { AuthError, signOut as amplifySignOut } from '@aws-amplify/auth'
// eslint-disable-next-line import/no-extraneous-dependencies
import { fetchAuthSession } from '@aws-amplify/core'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { PropsWithChildren, useRef } from 'react'

import { ROUTES } from '../api/constants'
import { useSsrAuth } from '../hooks/useSsrAuth'
import { amplifyConfig } from './amplifyConfig'
import logger from './logger'

/**
 * Based on: https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/nextjs/#configure-amplify-library-for-client-side-usage
 */
export function AmplifyProvider({ children }: PropsWithChildren) {
  useRef(amplifyConfig) // This is a hack to make sure amplifyConfig is used, so that it's not tree-shaken away.

  return children
}

const fetchAccessTokenString = async () => {
  const session = await fetchAuthSession()
  return session.tokens?.accessToken?.toString() ?? null
}

export const getAccessToken = async () => {
  try {
    return await fetchAccessTokenString()
  } catch (error) {
    if (error instanceof AuthError && error.name === 'NotAuthorizedException') {
      return null
    }
    throw error
  }
}

export const getAccessTokenOrLogout = async () => {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('No access token found.')
    }
    return accessToken
  } catch (error) {
    logger.error('Error getting access token - redirect to login.', error)
    window.location.assign(ROUTES.LOGIN)
    throw error
  }
}

export const useSignOut = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { userAttributes } = useSsrAuth()

  const signOut = async () => {
    try {
      logger.info(`[AUTH] Attempting to sign out email ${userAttributes?.email}`)
      await amplifySignOut()
      logger.info(`[AUTH] Successfully signed out email ${userAttributes?.email}`)
      // Removes user data from the cache.
      queryClient.removeQueries()
      await router.push(ROUTES.LOGIN)
    } catch (error) {
      logger.error(`[AUTH] Failed to sign out email ${userAttributes?.email}`, error)
      // Rethrow the error to be handled by the caller.
      throw error
    }
  }

  return { signOut }
}
