import { UrlObject } from 'node:url'

import { fetchAuthSession } from 'aws-amplify/auth'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'

import { ROUTES } from '../api/constants'
import {
  authRequestIdQueryParam,
  getRedirectUrl,
  getSafeRedirect,
  isHomeRedirect,
  isIdentityVerificationRequiredQueryParam,
  isOAuthQueryParam,
  redirectQueryParam,
} from '../utils/queryParamRedirect'
import { useOAuthParams } from './useOAuthParams'

export const useQueryParamRedirect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { isOAuth, authRequestId, isIdentityVerificationRequired } = useOAuthParams()

  const safeRedirect = useMemo(() => {
    const param = searchParams.get(redirectQueryParam)
    return getSafeRedirect(param)
  }, [searchParams])

  /**
   * Returns the redirect and oauth query params to be used in the next route.
   * Or returning empty object, which leads to ignoring all other unknown params.
   */
  const getRedirectQueryParams = useCallback(() => {
    return {
      ...(!isHomeRedirect(safeRedirect) && { [redirectQueryParam]: safeRedirect.url }),
      ...(isOAuth && { [isOAuthQueryParam]: isOAuth }),
      ...(authRequestId && { [authRequestIdQueryParam]: authRequestId }),
      ...(isIdentityVerificationRequired && {
        [isIdentityVerificationRequiredQueryParam]: isIdentityVerificationRequired,
      }),
    }
  }, [safeRedirect, isOAuth, authRequestId, isIdentityVerificationRequired])

  /**
   * If redirect param exists in the current URL the function appends it to the next route. Should be only used for
   * routes that support redirect query param (e.g. login, signup, etc.).
   */
  const getRouteWithRedirect = useCallback(
    (route: string): UrlObject => {
      return {
        pathname: route,
        query: getRedirectQueryParams(),
      }
    },
    [getRedirectQueryParams],
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
