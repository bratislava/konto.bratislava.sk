import { DefaultApiFactory, ScannerApiFactory, StatusesApiFactory } from './api'
import { Configuration } from './configuration'
import type { AxiosInstance } from 'axios'

export const createClamavScannerClient = (
  configuration: Configuration = {} as Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) => {
  const args = [configuration, basePath, axios] as const

  return {
    ...DefaultApiFactory(...args),
    ...ScannerApiFactory(...args),
    ...StatusesApiFactory(...args),
  }
}
