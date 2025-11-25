'use client'

import { Amplify } from 'aws-amplify'
import { PropsWithChildren } from 'react'

import { amplifyConfig, amplifyLibraryOptions } from './amplifyConfig'
import { AmplifyClientOAuthProvider } from './useAmplifyClientOAuthContext'

Amplify.configure(amplifyConfig, amplifyLibraryOptions)

// https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/#configure-amplify-library-for-client-side-usage
const AmplifyClientProvider = ({ children }: PropsWithChildren) => (
  <AmplifyClientOAuthProvider>{children}</AmplifyClientOAuthProvider>
)

export default AmplifyClientProvider
