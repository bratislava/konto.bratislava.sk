import { ROUTES } from 'frontend/api/constants'
import logger from 'frontend/utils/logger'
import { getValidRedirectFromQuery } from 'frontend/utils/sso'
import { useRouter } from 'next/router'
import React, { useCallback, useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import useAccount from './useAccount'

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
  const { getAccessToken } = useAccount()
  const redirectTargetIsAnotherPage = !redirectTarget.startsWith('/')

  const redirect = useCallback(async () => {
    if (redirectTarget.startsWith('/')) {
      router.push(redirectTarget).catch((error_) => logger.error('Failed redirect', error_))
    } else {
      let accessToken: string | null = null
      try {
        accessToken = await getAccessToken()
      } catch (error) {
        logger.error('Failed to get access token for redirect', error)
      }
      window.location.href = accessToken
        ? `${redirectTarget}?access_token=${accessToken}`
        : redirectTarget
    }
  }, [getAccessToken, redirectTarget, router])

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
