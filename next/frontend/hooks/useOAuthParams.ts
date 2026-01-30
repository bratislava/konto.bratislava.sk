import { parseAsBoolean, useQueryState } from 'nuqs'

import {
  authRequestIdQueryParam,
  isIdentityVerificationRequiredQueryParam,
  isOAuthQueryParam,
} from '../utils/queryParamRedirect'

export const useOAuthParams = () => {
  const [isOAuth] = useQueryState(isOAuthQueryParam, parseAsBoolean.withDefault(false))
  const [authRequestId] = useQueryState(authRequestIdQueryParam)
  const [isIdentityVerificationRequired] = useQueryState(
    isIdentityVerificationRequiredQueryParam,
    parseAsBoolean.withDefault(false),
  )

  return {
    isOAuth,
    authRequestId,
    isIdentityVerificationRequired,
  }
}
