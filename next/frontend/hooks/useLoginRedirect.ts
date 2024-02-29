import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { ROUTES } from '../api/constants'
import { getAccessToken } from '../utils/amplifyClient'
import {
  getRedirectUrl,
  getSafeLoginRedirect,
  isDefaultLoginRedirect,
  loginRedirectQueryParam,
} from '../utils/safeLoginRedirect'

export const useLoginRedirect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const safeLoginRedirect = useMemo(() => {
    const from = searchParams.get(loginRedirectQueryParam)
    return getSafeLoginRedirect(from)
  }, [searchParams])

  const getRouteWithLoginRedirectParam = (route: string) => {
    if (safeLoginRedirect && !isDefaultLoginRedirect(safeLoginRedirect)) {
      return `${route}?${loginRedirectQueryParam}=${safeLoginRedirect.url}`
    }

    return route
  }

  const getRouteWithCurrentUrlAsLoginRedirect = (route: string) => {
    if (router.asPath === ROUTES.HOME) {
      return route
    }

    return `${route}?from=${router.asPath}`
  }

  const redirectAfterLogin = async () => {
    if (safeLoginRedirect) {
      const url = await getRedirectUrl(safeLoginRedirect, getAccessToken)
      return router.push(url)
    }

    return router.push(ROUTES.HOME)
  }

  return {
    safeLoginRedirect,
    getRouteWithLoginRedirectParam,
    getRouteWithCurrentUrlAsLoginRedirect,
    redirectAfterLogin,
  }
}
