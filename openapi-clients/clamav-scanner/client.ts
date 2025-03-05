import { DefaultApiFactory, ScannerApiFactory, StatusesApiFactory } from './api'
import { Configuration, ConfigurationParameters } from './configuration'
import type { AxiosInstance } from 'axios'

type ClientConfig = {
  basePath: string
  configurationParameters?: ConfigurationParameters
  axios?: AxiosInstance
}

export type ClamavScannerClient = ReturnType<typeof createClamavScannerClient>

export const createClamavScannerClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig) => {
  const configuration = new Configuration(configurationParameters)
  const args = [configuration, basePath, axios] as const

  return {
    ...DefaultApiFactory(...args),
    ...ScannerApiFactory(...args),
    ...StatusesApiFactory(...args),
  }
}
