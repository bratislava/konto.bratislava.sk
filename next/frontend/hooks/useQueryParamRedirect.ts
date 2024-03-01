import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { ROUTES } from '../api/constants'
import { getAccessToken } from '../utils/amplifyClient'
import {
  getRedirectUrl,
  getSafeRedirect,
  isDefaultRedirect,
  redirectQueryParam,
} from '../utils/queryParamRedirect'

export const useQueryParamRedirect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const safeRedirect = useMemo(() => {
    const param = searchParams.get(redirectQueryParam)
    return getSafeRedirect(param)
  }, [searchParams])

  const getRouteWithRedirect = (route: string) => {
    if (safeRedirect && !isDefaultRedirect(safeRedirect)) {
      return `${route}?${redirectQueryParam}=${safeRedirect.url}`
    }

    return route
  }

  const getRouteWithCurrentUrlRedirect = (route: string) => {
    if (router.asPath === ROUTES.HOME) {
      return route
    }

    return `${route}?from=${router.asPath}`
  }

  const redirect = async () => {
    if (safeRedirect) {
      const url = await getRedirectUrl(safeRedirect, getAccessToken)
      return router.push(url)
    }

    return router.push(ROUTES.HOME)
  }

  return {
    safeRedirect,
    getRouteWithRedirect,
    getRouteWithCurrentUrlRedirect,
    redirect,
  }
}
