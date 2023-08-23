import axios from 'axios'
import type { GetServerSidePropsContext } from 'next'

import { getSSRAccessToken } from '../components/logic/ServerSideAuthProvider'
import { getAccessToken, getAccessTokenOrLogout } from '../frontend/utils/amplify'

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
     * Route request is required when getting token in server environment.
     */
    accessTokenSsrReq?: GetServerSidePropsContext['req']
  }
}
axiosInstance.interceptors.request.use(async (config) => {
  if (config.accessToken !== 'always' && config.accessToken !== 'onlyAuthenticated') {
    return config
  }

  // for 'always' mode force logout client side, continue without token for onlyAuthenticated
  // process.browser is deprecated but assures that server code is not bundled in the client code
  if (process.browser) {
    const accessToken =
      config.accessToken === 'always' ? await getAccessTokenOrLogout() : await getAccessToken()

    if (accessToken) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  } else {
    if (!config.accessTokenSsrReq) {
      throw new Error(
        'accessTokenSsrReq is required when accessToken is set to true in server environment.',
      )
    }

    const accessToken = await getSSRAccessToken(config.accessTokenSsrReq)
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
