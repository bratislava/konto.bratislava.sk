import { ParsedUrlQuery } from 'node:querystring'

import { isAxiosError } from 'axios'
import { ClientInfoResponseDto, OAuth2AuthorizationErrorDto } from 'openapi-clients/city-account'

import { cityAccountClient } from '@/src/clients/city-account'
import logger from '@/src/frontend/utils/logger'
import { authRequestIdQueryParam, isOAuthQueryParam } from '@/src/frontend/utils/queryParamRedirect'

// OAuth2 error response shape - only structural check, no enum validation
// (RFC allows custom error codes, and we only need the shape for logging).
// Docs: https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
const isOAuth2AuthorizationErrorDto = (data: unknown): data is OAuth2AuthorizationErrorDto => {
  if (typeof data !== 'object' || data === null || !('error' in data)) {
    return false
  }
  const candidate = data as Record<string, unknown>
  if (typeof candidate.error !== 'string') {
    return false
  }
  const optionalStringKeys = ['error_description', 'error_uri', 'state'] as const

  return optionalStringKeys.every(
    (key) => !(key in candidate) || typeof candidate[key] === 'string',
  )
}

export const fetchClientInfo = async (
  queryParams: ParsedUrlQuery,
): Promise<ClientInfoResponseDto | null> => {
  const isOAuth = queryParams[isOAuthQueryParam]
  const authRequestId = queryParams[authRequestIdQueryParam]

  if (isOAuth !== 'true' || typeof authRequestId !== 'string') {
    return null
  }

  try {
    const response = await cityAccountClient.oAuth2ControllerInfo(authRequestId)

    return response.data
  } catch (error) {
    // Degrade to standalone (non-OAuth) registration/login only when the BE
    // returns a well-formed RFC 6749 error (e.g. stale/expired `authRequestId`
    // from bookmark/back button). Any other failure (5xx, network, malformed
    // body) rethrows so the page shows a 500 rather than silently dropping
    // OAuth context mid-flow.
    if (
      isAxiosError(error) &&
      error.response?.status === 400 &&
      isOAuth2AuthorizationErrorDto(error.response.data)
    ) {
      logger.warn(
        {
          authRequestId,
          oauth2Error: error.response.data.error,
          oauth2ErrorDescription: error.response.data.error_description,
        },
        '[fetchClientInfo] oauth2 info request rejected; continuing without OAuth context',
      )

      return null
    }

    throw error
  }
}
