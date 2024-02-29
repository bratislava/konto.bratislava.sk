import type { UrlObject } from 'node:url'

import { ROUTES } from 'frontend/api/constants'
import { GENERIC_ERROR_MESSAGE } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'

import { getAccessTokenOrLogout, getCurrentAuthenticatedUser } from '../utils/amplifyClient'
import { APPROVED_LOGIN_REDIRECT_ORIGINS } from '../utils/safeLoginRedirect'

interface LoginRegisterRedirectState {
  redirectTarget: string
  redirectTargetIsAnotherPage: boolean
  verificationRequired: boolean
  setRedirectReturnRoute: (newVerificationRequired: boolean) => void
  redirect: (sameSiteQuery?: UrlObject['query']) => Promise<void>
}

const LoginRegisterRedirectContext = React.createContext<LoginRegisterRedirectState>(
  {} as LoginRegisterRedirectState,
)

/**
 * Stores & provides access to state used to navigate user back to where they came from after appropriate login/registration/verification step
 * Useful both when using city-account as a SSO provider for other pages (see useEffect below for the API to be used for these) as well as local redirects
 * Also used to control provision of access_token to other sites in environments where iframes can't be relied upon
 *
 * We can provide optional query parameters when redirecting within this app - feel free to add more options as needed.
 */
export const LoginRegisterRedirectProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [redirectTarget, setRedirectTarget] = useState<string>(ROUTES.HOME)
  // verificationRequired controls whether the redirect is intended before or after identity verification step
  // use cases - if we are redirected to login/registration from swimming pools site, we don't want to ask for user's identity card, in case it's from taxes form we need this before sending them back
  const [verificationRequired, setVerificationRequired] = useState(false)
  const redirectTargetIsAnotherPage = !redirectTarget.startsWith('/')

  const resetRedirect = useCallback(() => {
    setRedirectTarget(ROUTES.HOME)
    setVerificationRequired(false)
  }, [])

  const setRedirectReturnRoute = useCallback((newVerificationRequired: boolean) => {
    setRedirectTarget(window.location.pathname)
    setVerificationRequired(newVerificationRequired)
  }, [])

  // note the query param is ignored when redirecting to a different site
  // this is because it's presently not needed and can help to prevent accidentally leaking data to other sites
  const redirect = useCallback(
    async (sameSiteQuery?: UrlObject['query']) => {
      try {
        const isSignedIn = !!(await getCurrentAuthenticatedUser())
        if (redirectTarget.startsWith('/')) {
          await (isSignedIn
            ? router.push({ pathname: redirectTarget, query: sameSiteQuery })
            : router.push(ROUTES.LOGIN))
          // if successful reset to default state to prevent further unexpected redirects
          resetRedirect()
        } else if (isSignedIn) {
          const accessToken = await getAccessTokenOrLogout()
          const redirectUrlWithToken = new URL(redirectTarget)
          if (APPROVED_LOGIN_REDIRECT_ORIGINS.includes(redirectUrlWithToken.origin)) {
            redirectUrlWithToken.searchParams.set('access_token', accessToken)
            window.location.href = redirectUrlWithToken.href
          } else {
            await router.push(ROUTES.HOME)
          }
        } else {
          window.location.href = redirectTarget
        }
      } catch (error) {
        logger.error(`${GENERIC_ERROR_MESSAGE} sso redirect error`, error)
      }
    },
    [redirectTarget, router, resetRedirect],
  )

  // we can provide redirection target in from query param (this can be another page from the approved list), verificationRequired is optional
  useEffect(() => {
    if (typeof router.query.from === 'string') {
      setRedirectTarget(router.query.from)
      setVerificationRequired(!!router.query.verificationRequired)
    }
  }, [router.query.from, router.query.verificationRequired])

  // every time user moves outside of login/register/verify section of the app, reset the redirects
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (
        typeof url === 'string' &&
        // TODO if this set gets used elsewhere, pull it into a separate constant ('onboarding' routes)
        ![
          ROUTES.FORGOTTEN_PASSWORD,
          ROUTES.LOGIN,
          ROUTES.REGISTER,
          ROUTES.IDENTITY_VERIFICATION,
        ].includes(url)
      ) {
        resetRedirect()
      }
    }

    router.events.on('routeChangeStart', handleRouteChange)
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [resetRedirect, router.events])

  return (
    <LoginRegisterRedirectContext.Provider
      value={{
        setRedirectReturnRoute,
        redirect: redirectAfterLogin,
        redirectTarget,
        verificationRequired,
        redirectTargetIsAnotherPage,
      }}
    >
      {children}
    </LoginRegisterRedirectContext.Provider>
  )
}

export default function useLoginRegisterRedirect() {
  const context = React.useContext(LoginRegisterRedirectContext)
  if (context === undefined) {
    throw new Error('useLoginRegisterRedirect must be used within a LoginRegisterRedirectProvider')
  }
  return context
}
