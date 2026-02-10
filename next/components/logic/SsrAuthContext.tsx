import React, { ComponentType, createContext } from 'react'

import { UserAttributes } from '@/frontend/dtos/accountDto'

export const ssrAuthContextPropKey = '__ssrAuthContext'

export interface SsrAuthContextType {
  isSignedIn: boolean
  userAttributes: UserAttributes | null
  guestIdentityId: string | null
}

export const SsrAuthContext = createContext<SsrAuthContextType | null>(null)

// eslint-disable-next-line @typescript-eslint/ban-types
export const SsrAuthProviderHOC = <Props extends {}>(Wrapped: ComponentType<Props>) => {
  // eslint-disable-next-line func-names
  return function (props: Props & { [ssrAuthContextPropKey]?: SsrAuthContextType }) {
    // eslint-disable-next-line react/destructuring-assignment
    const ssrAuthContext = props[ssrAuthContextPropKey]

    if (!ssrAuthContext) {
      throw new Error(`SsrAuthProviderHOC: '${ssrAuthContextPropKey}' is missing in page props. To fix the issue:
1. Use 'amplifyGetServerSideProps' to get server side auth data.
2. Remove 'skipSsrAuthContext: true' from amplifyGetServerSideProps options.`)
    }

    return (
      <SsrAuthContext.Provider value={ssrAuthContext}>
        <Wrapped {...props} />
      </SsrAuthContext.Provider>
    )
  }
}
