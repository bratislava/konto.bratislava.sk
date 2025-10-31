import { Amplify } from 'aws-amplify'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { CookieStorage, defaultStorage } from 'aws-amplify/utils'
import { useQueryState } from 'nuqs'
import { useCallback } from 'react'

import { amplifyConfig, amplifyLibraryOptions, createAmplifyConfig } from '../utils/amplifyConfig'
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

  const isOAuthLogin = !!clientId

  const amplifyConfigure = useCallback(() => {
    if (isOAuthLogin) {
      Amplify.configure(createAmplifyConfig({ clientId }), amplifyLibraryOptions)
      cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage) // Local storage
    } else {
      Amplify.configure(amplifyConfig, amplifyLibraryOptions)
      cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage()) // Cookies - default for our case
    }

    const currentConfig = Amplify.getConfig()

    return currentConfig.Auth?.Cognito.userPoolClientId
  }, [clientId, isOAuthLogin])

  return {
    isOAuthLogin,
    clientId,
    payload,
    redirectUri,
    state,
    amplifyConfigure,
  }
}
