import { cityAccountClient } from '@clients/city-account'
import { AuthSession } from 'aws-amplify/auth'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import qs from 'qs'

import { environment } from '../../environment'
import { ROUTES } from '../api/constants'
import logger from './logger'

export enum SafeRedirectType {
  Local = 'local',
  Remote = 'remote',
}

export const redirectQueryParam = 'from'
export const clientIdQueryParam = 'client_id'
export const payloadQueryParam = 'payload'
export const redirectUriQueryParam = 'redirect_uri'
export const stateQueryParam = 'state'

export type SafeRedirect = {
  url: string
  type: SafeRedirectType
}

const homeSafeRedirect: SafeRedirect = {
  url: ROUTES.HOME,
  type: SafeRedirectType.Local,
}

export const isHomeRedirect = (loginRedirectResult: SafeRedirect) =>
  loginRedirectResult.url === ROUTES.HOME

/**
 * Returns a safe variant (including type) of the redirect query param. For remote URLs, we only allow a subset of origins.
 *
 * In case of invalid or unsafe redirect, the user is redirected to the home page.
 */
export const getSafeRedirect = (queryParam: unknown) => {
  if (typeof queryParam !== 'string') {
    return homeSafeRedirect
  }

  if (queryParam.startsWith('/')) {
    return {
      url: queryParam,
      type: SafeRedirectType.Local,
    }
  }

  try {
    const url = new URL(queryParam)
    if (environment.authApprovedOrigins.includes(url.origin)) {
      return {
        url: queryParam,
        type: SafeRedirectType.Remote,
      }
    }

    // eslint-disable-next-line no-empty
  } catch (error) {}

  return homeSafeRedirect
}

/**
 * We want to keep only viable and safe query params in the URL, otherwise it is removed.
 */
export const shouldRemoveRedirectQueryParam = (originalQueryParam: unknown) => {
  if (typeof originalQueryParam !== 'string') {
    return false
  }

  const safeRedirect = getSafeRedirect(originalQueryParam)
  if (isHomeRedirect(safeRedirect)) {
    return true
  }

  // If the "safe redirect" is different from the original query param, we want to remove the original query param
  return safeRedirect?.url !== originalQueryParam
}

/**
 * Parses the resolved URL and removes the redirect query param if it exists.
 *
 * @example
 * /some-path?from=/some-other-path -> /some-path
 * /some-path?from=/some-other-path&other=param -> /some-path?other=param
 * /some-path -> /some-path
 */
export const removeRedirectQueryParamFromUrl = (resolvedUrl: string) => {
  const splitUrl = resolvedUrl.split('?')
  if (splitUrl.length === 1) {
    return resolvedUrl
  }

  const [url, ...queryStringArray] = splitUrl
  const queryString = queryStringArray.join('')

  const queryParams = qs.parse(queryString)
  delete queryParams[redirectQueryParam]
  const newQueryString = qs.stringify(queryParams)

  if (newQueryString) {
    return `${url}?${newQueryString}`
  }
  return url
}

/**
 * Returns the URL to redirect to. "Remote" URLs in redirect query params are used to pass the access token to the target
 * domain, therefore we add the access token to the query string.
 */
export const getRedirectUrl = async (
  safeRedirect: SafeRedirect,
  fetchAuthSession: () => Promise<AuthSession>,
) => {
  if (safeRedirect.type === SafeRedirectType.Remote) {
    const parsedUrl = new URL(safeRedirect.url)
    const authSession = await fetchAuthSession()
    const accessToken = authSession.tokens?.accessToken.toString()
    if (accessToken) {
      parsedUrl.searchParams.set('access_token', accessToken)
    }
    return parsedUrl.toString()
  }

  return safeRedirect.url
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
  environment.authApprovedOrigins.forEach((domain) => {
    window?.top?.postMessage(message, domain)
  })
}

// TODO OAuth: types + check if all arguments exists...
export const handlePostOAuthTokens = async ({
  payload,
  clientId,
  redirectUri,
  state,
}: {
  payload: string | null
  clientId?: string | null
  redirectUri?: string | null
  state?: string | null
}) => {
  const { accessToken, idToken, refreshToken } =
    (await cognitoUserPoolsTokenProvider.authTokenStore.loadTokens()) ?? {}

  const access_token = accessToken?.toString()
  const id_token = idToken?.toString()
  const refresh_token = refreshToken
  // TODO OAuth remove tokens from logger
  logger.info(`[AUTH] Storing tokens to BE`)

  if (!access_token || !refresh_token || !payload) {
    logger.error(`[AUTH] Missing access_token or refresh_token or payload in handlePostOAuthTokens`)
    // TODO OAuth: handle error
    return
  }

  try {
    await cityAccountClient.oAuth2ControllerStoreTokens(
      {
        access_token,
        id_token,
        refresh_token,
        payload,
        client_id: clientId ?? undefined,
        redirect_uri: redirectUri ?? undefined,
        state: state ?? undefined,
      },
      // TODO OAuth: revisit and check if this is what we wanted
      { authStrategy: false },
    )
  } catch (error) {
    // TODO OAuth: handle error
    console.log(error)
  }
}

export const getOAuthContinueUrl = ({
  payload,
  clientId,
  redirectUri,
  state,
}: {
  payload: string | null
  clientId?: string | null
  redirectUri?: string | null
  state?: string | null
}) => {
  const parsedUrl = new URL(`${environment.cityAccountUrl}/oauth2/continue`)
  if (payload) {
    parsedUrl.searchParams.set(payloadQueryParam, payload)
  }
  if (clientId) {
    parsedUrl.searchParams.set(clientIdQueryParam, clientId)
  }
  if (redirectUri) {
    parsedUrl.searchParams.set(redirectUriQueryParam, redirectUri)
  }
  if (state) {
    parsedUrl.searchParams.set(stateQueryParam, state)
  }
  return parsedUrl
}
