import qs from 'qs'

import { ROUTES } from '../api/constants'
import { isProductionDeployment } from './general'

const productionOrigins = ['https://kupaliska.bratislava.sk', 'https://bratislava.sk']
const stagingOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'https://kupaliska.staging.bratislava.sk',
  'https://kupaliska.dev.bratislava.sk',
]

export const redirectQueryParam = 'from'

export const APPROVED_LOGIN_REDIRECT_ORIGINS = isProductionDeployment()
  ? productionOrigins
  : [...productionOrigins, ...stagingOrigins]

export enum SafeRedirectType {
  Local = 'local',
  Remote = 'remote',
}

export type SafeRedirect = {
  url: string
  type: SafeRedirectType
}

const defaultSafeRedirect: SafeRedirect = {
  url: ROUTES.HOME,
  type: SafeRedirectType.Local,
}

export const isDefaultRedirect = (loginRedirectResult: SafeRedirect) =>
  loginRedirectResult.url === ROUTES.HOME

export const getSafeRedirect = (queryParam: string | unknown) => {
  if (typeof queryParam !== 'string') {
    return defaultSafeRedirect
  }

  if (queryParam.startsWith('/')) {
    return {
      url: queryParam,
      type: SafeRedirectType.Local,
    }
  }

  try {
    const url = new URL(queryParam)
    if (APPROVED_LOGIN_REDIRECT_ORIGINS.includes(url.origin)) {
      return {
        url: queryParam,
        type: SafeRedirectType.Remote,
      }
    }
    // eslint-disable-next-line no-empty
  } catch (error) {}

  return defaultSafeRedirect
}

export const shouldRemoveRedirectQueryParam = (originalQueryParam: unknown) => {
  if (typeof originalQueryParam !== 'string') {
    return false
  }

  const safeRedirect = getSafeRedirect(originalQueryParam)
  if (isDefaultRedirect(safeRedirect)) {
    return true
  }

  return safeRedirect?.url !== originalQueryParam
}

export const removeRedirectQueryParam = (resolvedUrl: string) => {
  const splitUrl = resolvedUrl.split('?')
  if (splitUrl.length === 1) {
    return resolvedUrl
  }

  const [url, ...queryString] = splitUrl
  const queryStringJoined = queryString.join('')

  const queryParams = qs.parse(queryStringJoined)
  delete queryParams[redirectQueryParam]
  const newQueryString = qs.stringify(queryParams)

  if (newQueryString) {
    return `${url}?${newQueryString}`
  }
  return url
}

export const getRedirectUrl = async (
  fromResult: SafeRedirect,
  getAccessToken: () => Promise<string | null>,
) => {
  if (fromResult.type === SafeRedirectType.Remote) {
    const parsedUrl = new URL(fromResult.url)
    // add access token to the query string
    const accessToken = await getAccessToken()
    if (accessToken) {
      parsedUrl.searchParams.set('access_token', accessToken)
    }
    return parsedUrl.toString()
  }

  return fromResult.url
}

export enum PostMessageTypes {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export interface CityAccountPostMessage {
  type: PostMessageTypes
  payload?: Record<string, string>
}

// postMessage to all approved domains at the window top
// in reality only one message will be sent, this exists to limit the possible domains only to hardcoded list in APPROVED_SSO_ORIGINS
export const postMessageToApprovedDomains = (message: CityAccountPostMessage) => {
  // TODO - log to faro if none of the origins match
  APPROVED_LOGIN_REDIRECT_ORIGINS.forEach((domain) => {
    window?.top?.postMessage(message, domain)
  })
}
