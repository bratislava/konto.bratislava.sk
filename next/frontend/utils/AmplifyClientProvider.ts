'use client'

import { Amplify } from 'aws-amplify'
import { PropsWithChildren } from 'react'

import { amplifyConfig, amplifyLibraryOptions } from '@/frontend/utils/amplifyConfig'

Amplify.configure(amplifyConfig, amplifyLibraryOptions)

// https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/#configure-amplify-library-for-client-side-usage
export default function AmplifyClientProvider({ children }: PropsWithChildren) {
  return children
}
