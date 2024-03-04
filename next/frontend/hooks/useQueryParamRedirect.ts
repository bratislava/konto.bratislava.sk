import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'

import { ROUTES } from '../api/constants'
import { getAccessToken } from '../utils/amplifyClient'
import {
  getRedirectUrl,
  getSafeRedirect,
  isHomeRedirect,
  redirectQueryParam,
} from '../utils/queryParamRedirect'

export const useQueryParamRedirect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const safeRedirect = useMemo(() => {
    const param = searchParams.get(redirectQueryParam)
    return getSafeRedirect(param)
  }, [searchParams])

  /**
   * If redirect param exists in the current URL the function appends it to the next route. Should be only used for
   * routes that support redirect query param (e.g. login, signup, etc.).
   */
  const getRouteWithRedirect = useCallback(
    (route: string) => {
      if (!isHomeRedirect(safeRedirect)) {
        return `${route}?${redirectQueryParam}=${safeRedirect.url}`
      }

      return route
    },
    [safeRedirect],
  )

  /**
   * Appends the current URL to the next route. Should be used when redirecting to login, signup, when want to return
   * to the current page after the action is completed.
   */
  const getRouteWithCurrentUrlRedirect = useCallback(
    (route: string) => {
      if (router.asPath === ROUTES.HOME) {
        return route
      }

      return `${route}?from=${router.asPath}`
    },
    [router.asPath],
  )

  /**
   * Redirects to the URL specified in the redirect query param.
   */
  const redirect = useCallback(async () => {
    const url = await getRedirectUrl(safeRedirect, getAccessToken)
    return router.push(url)
  }, [router, safeRedirect])

  return {
    safeRedirect,
    getRouteWithRedirect,
    getRouteWithCurrentUrlRedirect,
    redirect,
  }
}
