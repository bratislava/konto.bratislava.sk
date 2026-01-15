import { useQueryState } from 'nuqs'

import { authRequestIdQueryParam, isOAuthQueryParam } from '../utils/queryParamRedirect'

export const useOAuthParams = () => {
  const [isOAuth] = useQueryState(isOAuthQueryParam)
  const [authRequestId] = useQueryState(authRequestIdQueryParam)

  return {
    isOAuth,
    authRequestId,
  }
}
