import { ParsedUrlQuery } from 'node:querystring'

import { AuthError } from 'aws-amplify/auth'
import { fetchAuthSession, fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth/server'
import { GetServerSideProps } from 'next'
import { GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from 'next/types'

import { ssrAuthContextPropKey, SsrAuthContextType } from '../../components/logic/SsrAuthContext'
import { ROUTES } from '../api/constants'
import { baRunWithAmplifyServerContext } from './amplifyServerRunner'
import { AmplifyServerContextSpec } from './amplifyTypes'
import {
  getRedirectUrl,
  getSafeRedirect,
  redirectQueryParam,
  removeRedirectQueryParamFromUrl,
  shouldRemoveRedirectQueryParam,
} from './queryParamRedirect'

console.log('[DEBUG] Starting file execution')

const getIsSignedIn = async (amplifyContextSpec: AmplifyServerContextSpec) => {
  console.log('[DEBUG] Entering getIsSignedIn function')
  try {
    const { userId } = await getCurrentUser(amplifyContextSpec)
    console.log(`[DEBUG] User ID: ${userId}`)
    const isSignedIn = Boolean(userId)
    console.log(`[DEBUG] Is signed in: ${isSignedIn}`)
    return isSignedIn
  } catch (error) {
    console.error('[DEBUG] Error in getIsSignedIn:', error)
    if (error instanceof AuthError && error.name === 'UserUnAuthenticatedException') {
      console.log('[DEBUG] User is not authenticated')
      return false
    }
    throw error
  }
}

const getAccessToken = async (amplifyContextSpec: AmplifyServerContextSpec) => {
  console.log('[DEBUG] Entering getAccessToken function')
  const authSession = await fetchAuthSession(amplifyContextSpec)
  console.log('[DEBUG] Auth session:', JSON.stringify(authSession, null, 2))
  const accessToken = authSession.tokens?.accessToken.toString() ?? null
  console.log(`[DEBUG] Access token: ${accessToken ? 'Present' : 'Null'}`)
  return accessToken
}

/**
 * In Amplify V6, `getServerSideProps` must run in Amplify server context to execute Amplify operations. This is a
 * wrapper for getServerSideProps that runs in Amplify server context and handles common SSR auth logic:
 * - injects SSR auth context (is user signed in, user attributes) into `ssrAuthContextPropKey` prop
 * - redirects to login page if requiresSignIn is set to true and user is not signed in
 * - redirects to home page if requiresSignOut is set to true and user is signed in
 *
 * For auth pages that should redirect to specific URL after action (e.g. login/logout), `redirectQueryParam` needs to
 * be set to `true` to:
 * - remove the redirect query param from the URL if it is not a safe/viable redirect
 * - redirect to desired URL if requiresSignIn is set to true and user is not signed in
 * - redirect to desired URL if requiresSignOut is set to true and user is signed in
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
    amplifyContextSpec: AmplifyServerContextSpec
    getAccessToken: () => Promise<string | null>
    isSignedIn: boolean
  }) => Promise<GetServerSidePropsResult<Props>>,
  options?: {
    requiresSignIn?: boolean
    requiresSignOut?: boolean
    skipSsrAuthContext?: boolean
    redirectQueryParam?: boolean
  },
) => {
  console.log('[DEBUG] Entering amplifyGetServerSideProps function')
  console.log('[DEBUG] Options:', JSON.stringify(options, null, 2))

  const wrappedFn: GetServerSideProps<Props, Params, Preview> = (context) => {
    console.log('[DEBUG] Entering wrapped function', context)
    return baRunWithAmplifyServerContext({
      nextServerContext: { request: context.req, response: context.res },
      operation: async (contextSpec) => {
        console.log('[DEBUG] Entering baRunWithAmplifyServerContext operation', contextSpec)
        const isSignedIn = await getIsSignedIn(contextSpec)
        console.log(`[DEBUG] Is signed in: ${isSignedIn}`)
        const getAccessTokenFn = isSignedIn
          ? () => getAccessToken(contextSpec)
          : () => Promise.resolve(null)

        console.log(`[DEBUG] Redirect query param: ${context.query[redirectQueryParam]}`)
        if (
          options?.redirectQueryParam &&
          shouldRemoveRedirectQueryParam(context.query[redirectQueryParam])
        ) {
          console.log('[DEBUG] Removing redirect query param')
          const newDestination = removeRedirectQueryParamFromUrl(context.resolvedUrl)
          console.log(`[DEBUG] New destination: ${newDestination}`)
          return {
            redirect: {
              destination: newDestination,
              permanent: false,
            },
          }
        }

        const shouldRedirectNotSignedIn = options?.requiresSignIn && !isSignedIn
        const shouldRedirectNotSignedOut = options?.requiresSignOut && isSignedIn
        console.log(`[DEBUG] Should redirect not signed in: ${shouldRedirectNotSignedIn}`)
        console.log(`[DEBUG] Should redirect not signed out: ${shouldRedirectNotSignedOut}`)

        if (shouldRedirectNotSignedIn || shouldRedirectNotSignedOut) {
          if (options?.redirectQueryParam) {
            console.log('[DEBUG] Handling redirect with query param')
            const safeRedirect = getSafeRedirect(context.query[redirectQueryParam])
            console.log(`[DEBUG] Safe redirect: ${safeRedirect}`)
            const destination = await getRedirectUrl(safeRedirect, getAccessTokenFn)
            console.log(`[DEBUG] Redirect destination: ${destination}`)

            return {
              redirect: {
                destination,
                permanent: false,
              },
            }
          }

          console.log('[DEBUG] Handling redirect without query param')
          const redirectDestination = shouldRedirectNotSignedIn
            ? `${ROUTES.LOGIN}?${redirectQueryParam}=${encodeURIComponent(context.resolvedUrl)}`
            : ROUTES.HOME
          console.log(`[DEBUG] Redirect destination: ${redirectDestination}`)
          return {
            redirect: {
              destination: redirectDestination,
              permanent: false,
            },
          }
        }

        const shouldFetchUserAttributes = isSignedIn && !options?.skipSsrAuthContext
        console.log(`[DEBUG] Should fetch user attributes: ${shouldFetchUserAttributes}`)
        const [userAttributes, getServerSidePropsResult] = await Promise.all([
          shouldFetchUserAttributes ? fetchUserAttributes(contextSpec) : Promise.resolve(null),
          getServerSidePropsFn({
            context,
            amplifyContextSpec: contextSpec,
            getAccessToken: getAccessTokenFn,
            isSignedIn,
          }),
        ])

        console.log('[DEBUG] User attributes:', JSON.stringify(userAttributes, null, 2))
        console.log(
          '[DEBUG] Get server side props result:',
          JSON.stringify(getServerSidePropsResult, null, 2),
        )

        if ('props' in getServerSidePropsResult && !options?.skipSsrAuthContext) {
          console.log('[DEBUG] Returning props with SSR auth context')
          const finalProps = {
            ...(await getServerSidePropsResult.props),
            [ssrAuthContextPropKey]: { isSignedIn, userAttributes },
          }
          console.log('[DEBUG] Final props:', JSON.stringify(finalProps, null, 2))
          return {
            props: finalProps,
          } satisfies GetServerSidePropsResult<
            Props & { [ssrAuthContextPropKey]: SsrAuthContextType }
          >
        }

        console.log('[DEBUG] Returning original get server side props result')
        return getServerSidePropsResult
      },
    })
  }

  return wrappedFn
}

console.log('[DEBUG] File execution completed')
