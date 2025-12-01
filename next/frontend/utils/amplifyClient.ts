import { useQueryClient } from '@tanstack/react-query'
import { signOut as amplifySignOut } from 'aws-amplify/auth'
import { useRouter } from 'next/router'

import { ROUTES } from '../api/constants'
import { useSsrAuth } from '../hooks/useSsrAuth'
import logger from './logger'

// Attempts to fix https://github.com/aws-amplify/amplify-js/issues/13182
export const removeAllCookiesAndClearLocalStorage = () => {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim())
  cookies.forEach((cookie) => {
    const cookieName = cookie.split('=')[0]
    // https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    logger.info(`[AUTH] Removed cookie: ${cookieName}`)
  })
  localStorage.clear()
}

/**
 * Temporary fix for: https://github.com/aws-amplify/amplify-js/issues/14378
 *
 * Removes guest identity cookie, Amplify should remove it after successful sign in but does not.
 */
export const removeAmplifyGuestIdentityIdCookies = () => {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim())
  cookies.forEach((cookie) => {
    const cookieName = cookie.split('=')[0]

    if (cookieName.startsWith('com.amplify.Cognito.') && cookieName.endsWith('.identityId')) {
      // https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      logger.info(`[AUTH] Removed Cognito identity cookie: ${cookieName}`)
    }
  })
}

/**
 * Clear temporarily stored tokens in session storage when using OAuth sign up or sign in
 */
export const clearOAuthSessionStorage = () => {
  sessionStorage.clear()
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
