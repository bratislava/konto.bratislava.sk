import { fetchAuthSession } from 'aws-amplify/auth'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'

import { ROUTES } from '../api/constants'
import {
  clientIdQueryParam,
  getRedirectUrl,
  getSafeRedirect,
  isHomeRedirect,
  payloadQueryParam,
  redirectQueryParam,
  redirectUriQueryParam,
  stateQueryParam,
} from '../utils/queryParamRedirect'
import { useOAuthParams } from './useOAuthParams'

export const useQueryParamRedirect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { clientId, payload, redirectUri, state } = useOAuthParams()

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
        return `${route}?${redirectQueryParam}=${encodeURIComponent(safeRedirect.url)}`
      }

      return route
    },
    [safeRedirect],
  )

  /**
   * Returns the redirect query params to be used in the next route. // TODO OAuth update comment
   */
  const getRedirectQueryParams = useCallback(() => {
    if (!isHomeRedirect(safeRedirect)) {
      return { [redirectQueryParam]: safeRedirect.url }
    }

    // TODO OAuth: add isOAuthRedirect condition
    return {
      ...(clientId && { [clientIdQueryParam]: clientId }),
      ...(payload && { [payloadQueryParam]: payload }),
      ...(redirectUri && { [redirectUriQueryParam]: redirectUri }),
      ...(state && { [stateQueryParam]: state }),
    }
  }, [clientId, payload, redirectUri, safeRedirect, state])

  /**
   * Appends the current URL to the next route. Should be used when redirecting to login, signup, when want to return
   * to the current page after the action is completed.
   */
  const getRouteWithCurrentUrlRedirect = useCallback(
    (route: string) => {
      if (router.asPath === ROUTES.HOME) {
        return route
      }

      return `${route}?${redirectQueryParam}=${encodeURIComponent(router.asPath)}`
    },
    [router.asPath],
  )

  /**
   * Redirects to the URL specified in the redirect query param.
   */
  const redirect = useCallback(async () => {
    const url = await getRedirectUrl(safeRedirect, fetchAuthSession)
    return router.push(url)
  }, [router, safeRedirect])

  return {
    safeRedirect,
    getRouteWithRedirect,
    getRedirectQueryParams,
    getRouteWithCurrentUrlRedirect,
    redirect,
  }
}
