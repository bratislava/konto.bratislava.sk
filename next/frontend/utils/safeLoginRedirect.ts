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

export const loginRedirectQueryParam = 'from'

export const APPROVED_LOGIN_REDIRECT_ORIGINS = isProductionDeployment()
  ? productionOrigins
  : [...productionOrigins, ...stagingOrigins]

export enum LoginRedirectType {
  Local = 'local',
  Remote = 'remote',
}

export type SafeLoginRedirectResult = {
  url: string
  type: LoginRedirectType
}

const defaultSafeLoginRedirect: SafeLoginRedirectResult = {
  url: ROUTES.HOME,
  type: LoginRedirectType.Local,
}

export const isDefaultLoginRedirect = (loginRedirectResult: SafeLoginRedirectResult) =>
  loginRedirectResult.url === ROUTES.HOME

export const getSafeLoginRedirect = (loginRedirectUrl: string | unknown) => {
  if (typeof loginRedirectUrl !== 'string') {
    return defaultSafeLoginRedirect
  }

  if (loginRedirectUrl.startsWith('/')) {
    return {
      url: loginRedirectUrl,
      type: LoginRedirectType.Local,
    }
  }

  try {
    const url = new URL(loginRedirectUrl)
    if (APPROVED_LOGIN_REDIRECT_ORIGINS.includes(url.origin)) {
      return {
        url: loginRedirectUrl,
        type: LoginRedirectType.Remote,
      }
    }
    // eslint-disable-next-line no-empty
  } catch (error) {}

  return defaultSafeLoginRedirect
}

export const shouldRemoveLoginRedirectParam = (originalFrom: string | undefined | unknown) => {
  if (originalFrom == null) {
    return false
  }
  const safeLoginRedirect = getSafeLoginRedirect(originalFrom)
  if (isDefaultLoginRedirect(safeLoginRedirect)) {
    return true
  }

  return safeLoginRedirect?.url !== originalFrom
}

export const removeFromFromResolvedUrl = (resolvedUrl: string) => {
  const splitUrl = resolvedUrl.split('?')
  if (splitUrl.length === 1) {
    return resolvedUrl
  }

  const [url, ...queryString] = splitUrl
  const queryStringJoined = queryString.join('')

  const queryParams = qs.parse(queryStringJoined)
  delete queryParams[loginRedirectQueryParam]
  const newQueryString = qs.stringify(queryParams)

  if (newQueryString) {
    return `${url}?${newQueryString}`
  }
  return url
}

export const getRedirectUrl = async (
  fromResult: SafeLoginRedirectResult,
  getAccessToken: () => Promise<string | null>,
) => {
  if (fromResult.type === LoginRedirectType.Remote) {
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
