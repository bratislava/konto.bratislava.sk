import { useQueryClient } from '@tanstack/react-query'
import { AuthError, fetchAuthSession, signOut as amplifySignOut } from 'aws-amplify/auth'
import { useRouter } from 'next/router'

import { ROUTES } from '../api/constants'
import { useSsrAuth } from '../hooks/useSsrAuth'
import logger from './logger'

// Attempts to fix https://github.com/aws-amplify/amplify-js/issues/13182
export const removeAllCookiesAndClearLocalStorage = () => {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim())
  cookies.forEach((cookie) => {
    const cookieName = cookie.split('=')[0]
    if (cookieName !== 'gdpr-consents') {
      // https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  })
  localStorage.clear()
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
