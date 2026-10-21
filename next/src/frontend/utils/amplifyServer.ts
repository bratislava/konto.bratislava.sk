import { ParsedUrlQuery } from 'node:querystring'

import { AuthError, AuthSession } from 'aws-amplify/auth'
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth/server'
import { GetServerSideProps } from 'next'
import { GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from 'next/types'
import { UpsertUserRecordClientRequestDtoLoginClientEnum } from 'openapi-clients/city-account'

import { cityAccountClient, LoginClientEnum } from '@/src/clients/city-account'
import { ssrAuthContextPropKey, SsrAuthContextType } from '@/src/components/logic/SsrAuthContext'
import { baRunWithAmplifyServerContext } from '@/src/frontend/utils/amplifyServerRunner'
import { AmplifyServerContextSpec } from '@/src/frontend/utils/amplifyTypes'
import { fetchClientInfo } from '@/src/frontend/utils/fetchClientInfo'
import { isDefined } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'
import {
  authRequestIdQueryParam,
  getRedirectUrl,
  getSafeRedirect,
  isIdentityVerificationRequiredQueryParam,
  isOAuthQueryParam,
  redirectQueryParam,
  removeRedirectQueryParamFromUrl,
  shouldRemoveRedirectQueryParam,
} from '@/src/frontend/utils/queryParamRedirect'
import { ROUTES } from '@/src/utils/routes'

/**
 * Cognito errors meaning the identity ID stored in the cookie can't be used: it doesn't exist
 * (`ResourceNotFoundException`), it is linked to a user and used without that user's tokens (`NotAuthorizedException`:
 * "Access to Identity '…' is forbidden"), or it is malformed (`ValidationException`). Amplify then throws on every
 * request and never replaces the cookie: https://github.com/aws-amplify/amplify-js/issues/14975
 */
const unusableIdentityIdErrorNames = new Set([
  'ResourceNotFoundException',
  'NotAuthorizedException',
  'ValidationException',
])

/** Marks the `fetchAuthSession` failure of the wrapper itself, so errors from `getServerSidePropsFn` are never retried. */
class UnusableIdentityIdError extends Error {
  constructor(readonly authError: AuthError) {
    super(authError.message)
    this.name = 'UnusableIdentityIdError'
  }
}

const findIdentityIdCookieName = (cookies: Partial<Record<string, string>>) =>
  Object.keys(cookies).find(
    (name) => name.startsWith('com.amplify.Cognito.') && name.endsWith('.identityId'),
  )

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
  Props extends Record<string, any> = Record<string, any>,
  Params extends ParsedUrlQuery = ParsedUrlQuery,
  Preview extends PreviewData = PreviewData,
>(
  getServerSidePropsFn: (args: {
    context: GetServerSidePropsContext<Params, Preview>
    amplifyContextSpec: AmplifyServerContextSpec
    fetchAuthSession: () => Promise<AuthSession>
    isSignedIn: boolean
  }) => Promise<GetServerSidePropsResult<Props>>,
  options?: {
    requiresSignIn?: boolean
    requiresSignOut?: boolean
    isOAuthRedirect?: boolean
    skipSsrAuthContext?: boolean
    redirectQueryParam?: boolean
    redirectOAuthParams?: boolean
  },
) => {
  const runInAmplifyServerContext = (context: GetServerSidePropsContext<Params, Preview>) =>
    baRunWithAmplifyServerContext({
      nextServerContext: { request: context.req, response: context.res },
      operation: async (contextSpec) => {
        const fetchAuthSessionFn = () => fetchAuthSession(contextSpec)

        let authSession: AuthSession
        try {
          // `fetchAuthSession` must be called in each request, otherwise guests wouldn't receive identity ID
          authSession = await fetchAuthSessionFn()
        } catch (error) {
          if (error instanceof AuthError && unusableIdentityIdErrorNames.has(error.name)) {
            throw new UnusableIdentityIdError(error)
          }
          throw error
        }
        const isSignedIn = Boolean(authSession.tokens)

        if (
          options?.redirectQueryParam &&
          shouldRemoveRedirectQueryParam(context.query[redirectQueryParam])
        ) {
          return {
            redirect: {
              destination: removeRedirectQueryParamFromUrl(context.resolvedUrl),
              permanent: false,
            },
          }
        }

        let oAuthParams = ''
        if (options?.redirectOAuthParams) {
          // TODO rewrite in cleaner way
          oAuthParams = context.query
            ? [
                context.query[isOAuthQueryParam]
                  ? `${isOAuthQueryParam}=${context.query[isOAuthQueryParam]}`
                  : undefined,
                context.query[authRequestIdQueryParam]
                  ? `${authRequestIdQueryParam}=${context.query[authRequestIdQueryParam]}`
                  : undefined,
                context.query[isIdentityVerificationRequiredQueryParam]
                  ? `${isIdentityVerificationRequiredQueryParam}=${context.query[isIdentityVerificationRequiredQueryParam]}`
                  : undefined,
              ]
                .filter(isDefined)
                .join('&')
            : ''
        }

        if (options?.isOAuthRedirect) {
          if (!isSignedIn) {
            return {
              redirect: {
                destination: `${ROUTES.LOGIN}?${oAuthParams}`,
                permanent: false,
              },
            }
          }

          const clientInfo = await fetchClientInfo(context.query)

          await cityAccountClient.userControllerUpsertUserAndRecordClient(
            {
              loginClient:
                (clientInfo?.clientName as UpsertUserRecordClientRequestDtoLoginClientEnum) ??
                LoginClientEnum.CityAccount,
            },
            { authStrategy: 'authOnly', getSsrAuthSession: fetchAuthSessionFn },
          )

          return {
            redirect: {
              destination: `${ROUTES.OAUTH_CONFIRM}?${oAuthParams}`,
              permanent: false,
            },
          }
        }

        const shouldRedirectNotSignedIn = options?.requiresSignIn && !isSignedIn
        const shouldRedirectNotSignedOut = options?.requiresSignOut && isSignedIn

        if (shouldRedirectNotSignedIn || shouldRedirectNotSignedOut) {
          if (options?.redirectQueryParam) {
            const safeRedirect = getSafeRedirect(context.query[redirectQueryParam])
            const destination = await getRedirectUrl(safeRedirect, fetchAuthSessionFn)

            return {
              redirect: {
                destination,
                permanent: false,
              },
            }
          }

          if (options?.redirectOAuthParams && shouldRedirectNotSignedIn) {
            return {
              redirect: {
                destination: `${ROUTES.LOGIN}?${oAuthParams}`,
                permanent: false,
              },
            }
          }

          return {
            redirect: {
              destination: shouldRedirectNotSignedIn
                ? `${ROUTES.LOGIN}?${redirectQueryParam}=${encodeURIComponent(context.resolvedUrl)}`
                : ROUTES.HOME,
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
            fetchAuthSession: fetchAuthSessionFn,
            isSignedIn,
          }),
        ])
        const guestIdentityId = isSignedIn ? null : authSession.identityId!

        if ('props' in getServerSidePropsResult && !options?.skipSsrAuthContext) {
          return {
            props: {
              // props could be a promise, so we need to await it, if it is not a promise, it will be resolved immediately
              ...(await getServerSidePropsResult.props),
              [ssrAuthContextPropKey]: {
                isSignedIn,
                userAttributes,
                guestIdentityId,
              },
            },
          } satisfies GetServerSidePropsResult<
            Props & { [ssrAuthContextPropKey]: SsrAuthContextType }
          >
        }

        return getServerSidePropsResult
      },
    })

  const wrappedFn: GetServerSideProps<Props, Params, Preview> = async (context) => {
    try {
      return await runInAmplifyServerContext(context)
    } catch (error) {
      if (!(error instanceof UnusableIdentityIdError)) {
        throw error
      }
      const cookieName = findIdentityIdCookieName(context.req.cookies)
      if (!cookieName) {
        throw error.authError
      }

      // Retry once without the cookie, so Amplify gets a new identity ID: a new guest identity, or the signed-in user's
      // own one. The Amplify server context reads cookies from `context.req.cookies` when it is created, so removing the
      // cookie there is enough. The deletion makes the browser drop it too; for a guest, the new identity ID set by the
      // retry comes after it in the response and replaces it.
      const { [cookieName]: unusableIdentityId, ...otherCookies } = context.req.cookies
      logger.warn(
        `[AUTH] Unusable identity ID ${unusableIdentityId} in cookie (${error.authError.name}: ${error.authError.message}), retrying without it`,
      )
      context.req.cookies = otherCookies
      context.res.appendHeader(
        'Set-Cookie',
        `${cookieName}=;Path=/;Expires=${new Date(0).toUTCString()}`,
      )

      try {
        return await runInAmplifyServerContext(context)
      } catch (retryError) {
        throw retryError instanceof UnusableIdentityIdError ? retryError.authError : retryError
      }
    }
  }

  return wrappedFn
}
