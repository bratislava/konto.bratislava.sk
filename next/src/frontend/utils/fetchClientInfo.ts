import { ParsedUrlQuery } from 'node:querystring'

import { ClientInfoResponseDto } from 'openapi-clients/city-account'

import { cityAccountClient } from '@/src/clients/city-account'
import { errorToLogFields } from '@/src/frontend/utils/errors'
import logger from '@/src/frontend/utils/logger'
import { authRequestIdQueryParam, isOAuthQueryParam } from '@/src/frontend/utils/queryParamRedirect'

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
    logger.error(
      { err: errorToLogFields(error), authRequestId },
      '[fetchClientInfo] oauth2 info request failed',
    )

    throw error
  }
}
