import { AuthSession, fetchAuthSession } from 'aws-amplify/auth'
import axios, { AxiosRequestConfig } from 'axios'
import axiosRetry from 'axios-retry'

export const axiosInstance = axios.create()

axiosRetry(axiosInstance, { retries: 0 })

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Defines the authentication strategy for this request.
     *
     * You must decide which strategy to use based on the backend and the specific route:
     * - Some backends/routes only allow authenticated users.
     * - Some allow both authenticated and guest users, but require a guest token for guests (Forms BE).
     * - Some allow both, but do not accept a guest token.
     * - Some routes are fully public and require no authentication.
     *
     * | Value                         | Authenticated User (Session with Tokens)       | Guest User (Session without Tokens)         |
     * |-------------------------------|------------------------------------------------|---------------------------------------------|
     * | 'authOnly'                    | Adds `Authorization: Bearer <accessToken>`.    | Throws an error (route is auth-only).       |
     * | 'authOrGuestWithToken'        | Adds `Authorization: Bearer <accessToken>`.    | Adds `X-Cognito-Guest-Identity-Id`.         |
     * | 'authOrGuestNoToken'          | Adds `Authorization: Bearer <accessToken>`.    | Proceeds without adding auth headers.       |
     * | 'noAuth' (or undefined/false) | Proceeds without adding auth headers.          | Proceeds without adding auth headers.       |
     */
    authStrategy?: 'authOnly' | 'authOrGuestWithToken' | 'authOrGuestNoToken' | 'noAuth' | false

    /**
     * Function to retrieve the AuthSession in a Server-Side Rendering (SSR) context.
     * **Required** when `authStrategy` is set to 'authOnly', 'authOrGuestWithToken', or 'authOrGuestNoToken'
     * and the code is running in a non-browser environment (e.g., Next.js getServerSideProps).
     */
    getSsrAuthSession?: () => Promise<AuthSession>
  }
}

/**
 * This type is needed to work around TypeScript module augmentation limitations when dealing with locally installed packages.
 *
 * Problem:
 * The openapi-clients package has its own axios dependency (as a peer dependency) with its own type definitions.
 * When TypeScript resolves types for the openapi-clients methods, it uses the axios types from
 * openapi-clients/node_modules/axios/index.d.ts rather than our augmented types above.
 *
 * This happens because TypeScript module augmentations don't propagate across package boundaries,
 * especially with locally installed packages that have their own node_modules.
 *
 * Solution:
 * We create this helper type to explicitly map the API client methods to use our extended AxiosRequestConfig.
 * By casting the client to this type, we tell TypeScript to use our augmented type for all methods
 * that accept an options parameter.
 *
 * Usage:
 * import { createApiClient, ApiClient } from 'openapi-clients/some-api';
 * export const apiClient = createApiClient({...}) as ClientWithCustomConfig<ApiClient>;
 */
export type ClientWithCustomConfig<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer R
    ? Args extends [...infer Params, options?: AxiosRequestConfig]
      ? (...args: [...Params, options?: AxiosRequestConfig]) => R
      : T[K]
    : T[K]
}

axiosInstance.interceptors.request.use(async (config) => {
  if (
    config.authStrategy !== 'authOnly' &&
    config.authStrategy !== 'authOrGuestWithToken' &&
    config.authStrategy !== 'authOrGuestNoToken'
  ) {
    return config
  }

  let authSession: AuthSession

  // Client side:
  // process.browser is deprecated but assures that server code is not bundled in the client code
  if (process.browser) {
    authSession = await fetchAuthSession()
  }
  // Server side:
  else {
    if (!config.getSsrAuthSession) {
      throw new Error(
        'getSsrAuthSession is required when authStrategy is present in a non-browser environment.',
      )
    }
    authSession = await config.getSsrAuthSession()
  }

  if (!authSession.identityId) {
    // If guest access is enabled both in Amplify client configuration and Amplify admin console administration, this should never happen.
    throw new Error(
      'Failed to retrieve identityId from authentication session. Please check that guest access is enabled in the Amplify client configuration and the Amplify admin console.',
    )
  }

  // `authSession.tokens` is synonymous with user being signed in
  if (authSession.tokens) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${authSession.tokens.accessToken.toString()}`
    return config
  }

  switch (config.authStrategy) {
    case 'authOnly':
      throw new Error('Authentication required, but no access token found in session.')

    case 'authOrGuestWithToken':
      // eslint-disable-next-line no-param-reassign
      config.headers['X-Cognito-Guest-Identity-Id'] = authSession.identityId
      break

    default:
      break
  }

  return config
})
