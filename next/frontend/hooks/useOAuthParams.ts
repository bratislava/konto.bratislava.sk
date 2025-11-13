import { Amplify } from 'aws-amplify'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { CookieStorage, sessionStorage } from 'aws-amplify/utils'
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
      cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage) // Session storage - for oauth flow
    } else {
      Amplify.configure(amplifyConfig, amplifyLibraryOptions)
      // Setting cookie storage based on default setting, see https://github.com/aws-amplify/amplify-js/blob/%40aws-amplify/adapter-nextjs%401.6.8/packages/aws-amplify/src/initSingleton.ts#L41
      cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage({ sameSite: 'lax' })) // Cookies - default for SSR
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
