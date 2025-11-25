'use client'

import { Amplify } from 'aws-amplify'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { sessionStorage } from 'aws-amplify/utils'
import { PropsWithChildren } from 'react'

import { amplifyConfig, amplifyLibraryOptions, createAmplifyConfig } from './amplifyConfig'
import { isBrowser } from './general'
import { clientIdQueryParam } from './queryParamRedirect'

Amplify.configure(amplifyConfig, amplifyLibraryOptions)

// Reconfigure Amplify on client-side for oauth flow. This results to hydration error, that we ignore.
if (isBrowser()) {
  const searchParams = new URLSearchParams(window.location.search)
  const clientId = searchParams.get(clientIdQueryParam)

  if (clientId) {
    Amplify.configure(createAmplifyConfig({ clientId }), amplifyLibraryOptions)
    cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage) // Session storage - for oauth flow
  }
}

// https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/#configure-amplify-library-for-client-side-usage
export default function AmplifyClientProvider({ children }: PropsWithChildren) {
  return children
}
