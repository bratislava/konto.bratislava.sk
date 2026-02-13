import { ParsedUrlQuery } from 'node:querystring'

import { ClientInfoResponseDto } from 'openapi-clients/city-account'

import { cityAccountClient } from '@/clients/city-account'
import { authRequestIdQueryParam, isOAuthQueryParam } from '@/frontend/utils/queryParamRedirect'

export const fetchClientInfo = async (queryParams: ParsedUrlQuery) => {
  const isOAuth = queryParams[isOAuthQueryParam]
  const authRequestId = queryParams[authRequestIdQueryParam]

  let clientInfo: null | ClientInfoResponseDto = null

  if (isOAuth === 'true' && typeof authRequestId === 'string') {
    clientInfo = await cityAccountClient
      .oAuth2ControllerInfo(authRequestId)
      .then((response) => response.data)
  }

  return clientInfo
}
