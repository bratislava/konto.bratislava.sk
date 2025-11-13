import { useQueryState } from 'nuqs'

import {
  clientIdQueryParam,
  payloadQueryParam,
  redirectUriQueryParam,
  stateQueryParam,
} from '../utils/queryParamRedirect'

export const useOAuthParams = () => {
  const [clientId] = useQueryState(clientIdQueryParam)
  const [payload] = useQueryState(payloadQueryParam)
  const [redirectUri] = useQueryState(redirectUriQueryParam)
  const [state] = useQueryState(stateQueryParam)

  return {
    clientId,
    payload,
    redirectUri,
    state,
  }
}
