import axios, { AxiosRequestConfig } from 'axios'

import { getAccessToken, getAccessTokenOrLogout } from '../frontend/utils/amplifyClient'

export const axiosInstance = axios.create()

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Whether to add Authorization header with access token.
     *
     * | Value             | Authenticated                                                 | Unauthenticated |
     * |-------------------|---------------------------------------------------------------|-----------------|
     * | always            | Try to get access token, if success continue, otherwise fail. | Fail.           |
     * | onlyAuthenticated | Try to get access token, if success continue, otherwise fail. | Continue.       |
     */
    accessToken?: 'always' | 'onlyAuthenticated' | false
    /**
     * In server environment, a function to get access token must be provided.
     */
    accessTokenSsrGetFn?: () => Promise<string | null>
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
  if (config.accessToken !== 'always' && config.accessToken !== 'onlyAuthenticated') {
    return config
  }

  // for 'always' mode force logout client side, continue without token for onlyAuthenticated
  // process.browser is deprecated but assures that server code is not bundled in the client code
  // Client side:
  if (process.browser) {
    const accessToken =
      config.accessToken === 'always' ? await getAccessTokenOrLogout() : await getAccessToken()

    if (accessToken) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  }
  // Server side:
  else {
    if (!config.accessTokenSsrGetFn) {
      throw new Error(
        'accessTokenSsrGetFn is required when accessToken is set to true in server environment.',
      )
    }

    const accessToken = await config.accessTokenSsrGetFn()
    if (accessToken) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${accessToken}`
    } else if (config.accessToken === 'always') {
      throw new Error(
        'No accessToken found with accessToken set to `always` in a server side request',
      )
    }
  }

  return config
})
