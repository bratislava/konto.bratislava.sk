'use client'

import { Amplify } from 'aws-amplify'
import { Hub } from 'aws-amplify/utils'
import { PropsWithChildren } from 'react'

import { getAmplifyGuestIdentityId } from '@/src/frontend/utils/amplifyClient'
import { amplifyConfig, amplifyLibraryOptions } from '@/src/frontend/utils/amplifyConfig'
import { isBrowser } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

Amplify.configure(amplifyConfig, amplifyLibraryOptions)

// Amplify's first credentials request after sign-in links the guest identity to the user, after which it can no longer
// be used as a guest. Logging the guest identity ID with the user (`userId` is the Cognito `sub`) at sign-in lets an
// identity ID that later shows up in an error be traced to the user it belongs to. Every sign-in API (including auto
// sign-in after registration) dispatches `signedIn` before it returns.
if (isBrowser()) {
  Hub.listen('auth', ({ payload }) => {
    if (payload.event === 'signedIn') {
      logger.info(
        `[AUTH] Signed in user ${payload.data.userId} with guest identity ID ${getAmplifyGuestIdentityId() ?? '(none)'}`,
      )
    }
  })
}

// https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/#configure-amplify-library-for-client-side-usage
export default function AmplifyClientProvider({ children }: PropsWithChildren) {
  return children
}
