import { ParsedUrlQuery } from 'node:querystring'

/* eslint-disable import/no-extraneous-dependencies */
import { createServerRunner } from '@aws-amplify/adapter-nextjs'
import { AuthError } from '@aws-amplify/auth'
import { fetchUserAttributes, getCurrentUser } from '@aws-amplify/auth/server'
import type { AmplifyServer } from '@aws-amplify/core/dist/esm/adapterCore'
import { fetchAuthSession } from '@aws-amplify/core/server'
/* eslint-enable import/no-extraneous-dependencies */
import { GetServerSideProps } from 'next'
import { GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from 'next/types'

import { ssrAuthContextPropKey, SsrAuthContextType } from '../../components/logic/SsrAuthContext'
import { ROUTES } from '../api/constants'
import { amplifyConfig } from './amplifyConfig'

export const { runWithAmplifyServerContext } = createServerRunner({
  config: amplifyConfig,
})

const getIsSignedIn = async (context: AmplifyServer.ContextSpec) => {
  try {
    const { userId } = await getCurrentUser(context)
    return Boolean(userId)
  } catch (error) {
    if (error instanceof AuthError && error.name === 'UserUnAuthenticatedException') {
      return false
    }
    throw error
  }
}

const getAccessToken = async (amplifyContextSpec: AmplifyServer.ContextSpec) => {
  const authSession = await fetchAuthSession(amplifyContextSpec)
  return authSession.tokens?.accessToken.toString() ?? null
}

/**
 * In Amplify V6, `getServerSideProps` must run in Amplify server context to execute Amplify operations. This is a
 * wrapper for getServerSideProps that runs in Amplify server context and handles common SSR auth logic:
 *
 * - injects SSR auth context (is user signed in, user attributes) into `ssrAuthContextPropKey` prop
 * - redirects to login page if requiresSignIn is set to true and user is not signed in
 * - redirects to home page if requiresSignOut is set to true and user is signed in
 *
 * Also, for some reason `fetchUserAttributes` takes very long (~450ms) to fetch (note - it takes only ~100ms in the
 * browser), in the past, this blocked the rendering of the page, so in this solution it is fetched in parallel with
 * `getServerSidePropsFn` and then injected into the props. It is what makes this function complicated, but it is worth
 * the effort. In the future, we should examine why it takes so long and then we will be able to simplify this function.
 */
export const amplifyGetServerSideProps = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Props extends { [key: string]: any } = { [key: string]: any },
  Params extends ParsedUrlQuery = ParsedUrlQuery,
  Preview extends PreviewData = PreviewData,
>(
  getServerSidePropsFn: (args: {
    context: GetServerSidePropsContext<Params, Preview>
    amplifyContextSpec: AmplifyServer.ContextSpec
    getAccessToken: () => Promise<string | null>
    isSignedIn: boolean
  }) => Promise<GetServerSidePropsResult<Props>>,
  options?: {
    requiresSignIn?: boolean
    requiresSignOut?: boolean
    skipSsrAuthContext?: boolean
  },
) => {
  const wrappedFn: GetServerSideProps<Props, Params, Preview> = (context) =>
    runWithAmplifyServerContext({
      nextServerContext: { request: context.req, response: context.res },
      operation: async (contextSpec) => {
        const isSignedIn = await getIsSignedIn(contextSpec)

        if (options?.requiresSignIn && !isSignedIn) {
          return {
            redirect: {
              destination: `${ROUTES.LOGIN}?from=${context.resolvedUrl}`,
              permanent: false,
            },
          }
        }

        if (options?.requiresSignOut && isSignedIn) {
          return {
            redirect: {
              destination: ROUTES.HOME,
              permanent: false,
            },
          }
        }

        const shouldFetchUserAttributes = isSignedIn && !options?.skipSsrAuthContext
        const [userAttributes, getServerSidePropsResult] = await Promise.all([
          shouldFetchUserAttributes ? fetchUserAttributes(contextSpec) : Promise.resolve(null),
          getServerSidePropsFn({
            context,
            amplifyContextSpec: contextSpec,
            getAccessToken: isSignedIn
              ? () => getAccessToken(contextSpec)
              : () => Promise.resolve(null),
            isSignedIn,
          }),
        ])

        if ('props' in getServerSidePropsResult && !options?.skipSsrAuthContext) {
          return {
            props: {
              // props could be a promise, so we need to await it, if it is not a promise, it will be resolved immediately
              ...(await getServerSidePropsResult.props),
              [ssrAuthContextPropKey]: { isSignedIn, userAttributes },
            },
          } satisfies GetServerSidePropsResult<
            Props & { [ssrAuthContextPropKey]: SsrAuthContextType }
          >
        }

        return getServerSidePropsResult
      },
    })

  return wrappedFn
}