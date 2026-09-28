import { HealthApiFactory, ScannerApiFactory, StatusesApiFactory } from './api'
import { Configuration, ConfigurationParameters } from './configuration'
import type { AxiosInstance } from 'axios'

type ClientConfig = {
  basePath: string
  configurationParameters?: ConfigurationParameters
  axios?: AxiosInstance
}

export interface ClamavScannerClient
  extends
    ReturnType<typeof HealthApiFactory>,
    ReturnType<typeof ScannerApiFactory>,
    ReturnType<typeof StatusesApiFactory> {}

export const createClamavScannerClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig): ClamavScannerClient => {
  const configuration = new Configuration(configurationParameters)
  const args = [configuration, basePath, axios] as const

  return {
    ...HealthApiFactory(...args),
    ...ScannerApiFactory(...args),
    ...StatusesApiFactory(...args),
  } satisfies ClamavScannerClient
}
