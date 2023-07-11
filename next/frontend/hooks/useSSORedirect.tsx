import { ROUTES } from 'frontend/api/constants'
import { getAccessTokenOrLogout, getCurrentAuthenticatedUser } from 'frontend/utils/amplify'
import { GENERIC_ERROR_MESSAGE } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { getValidRedirectFromQuery } from 'frontend/utils/sso'
import { useRouter } from 'next/router'
import React, { useCallback, useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

interface SSORedirectState {
  redirectTarget: string
  redirectTargetIsAnotherPage: boolean
  setRedirect: (newTarget: string) => void
  redirect: () => Promise<void>
}

const SSORedirectContext = React.createContext<SSORedirectState>({} as SSORedirectState)

export const SSORedirectProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [redirectTarget, setRedirectTarget] = useState<string>(ROUTES.HOME)
  const redirectTargetIsAnotherPage = !redirectTarget.startsWith('/')

  const redirect = useCallback(async () => {
    try {
      if (redirectTarget.startsWith('/')) {
        const isAuthenticated = !!(await getCurrentAuthenticatedUser())
        await (isAuthenticated ? router.push(redirectTarget) : router.push(ROUTES.LOGIN))
      } else {
        const accessToken = await getAccessTokenOrLogout()
        if (accessToken) {
          const redirectUrlWithToken = new URL(redirectTarget)
          redirectUrlWithToken.searchParams.set('access_token', accessToken)
          window.location.href = redirectUrlWithToken.href
        } else {
          window.location.href = redirectTarget
        }
      }
    } catch (error) {
      logger.error(`${GENERIC_ERROR_MESSAGE} sso redirect error`, error)
    }
  }, [redirectTarget, router])

  // if trying to set incorrect redirect target, throws and keeps the previous value
  const setRedirect = useCallback((newTarget: string) => {
    const redirectTo = getValidRedirectFromQuery(newTarget)
    if (!redirectTo) throw new Error('Redirect path not valid, keeping previous value!')
    setRedirectTarget(redirectTo)
  }, [])

  useEffectOnce(() => {
    // if we're redirected from another site for login, we'll have the redirection target ready in 'from' query param on first load
    setRedirectTarget(getValidRedirectFromQuery(router.query.from) || ROUTES.HOME)
  })

  return (
    <SSORedirectContext.Provider
      value={{ setRedirect, redirect, redirectTarget, redirectTargetIsAnotherPage }}
    >
      {children}
    </SSORedirectContext.Provider>
  )
}

export default function useSSORedirect() {
  const context = React.useContext(SSORedirectContext)
  if (context === undefined) {
    throw new Error('useSSORedirect must be used within a SSORedirectProvider')
  }
  return context
}
