import axios from 'axios'

export const axiosInstance = axios.create()

// Adds a possibility to provide `accessToken` to Axios request options.
// TODO: Move to client factories after Cognito refactor.
declare module 'axios' {
  interface AxiosRequestConfig {
    accessToken?: string | null
  }
}
axiosInstance.interceptors.request.use((config) => {
  if (config.accessToken) {
    // eslint-disable-next-line no-param-reassign,@typescript-eslint/restrict-template-expressions
    config.headers.Authorization = `Bearer ${config.accessToken}`
  }
  return config
})
