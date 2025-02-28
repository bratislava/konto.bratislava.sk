import {
  ADMINApiFactory,
  ConvertApiFactory,
  FilesApiFactory,
  FormsApiFactory,
  GinisApiFactory,
  HealthcheckApiFactory,
  NasesApiFactory,
  SignerApiFactory,
  StatusesApiFactory,
} from './api'
import { Configuration, ConfigurationParameters } from './configuration'
import type { AxiosInstance } from 'axios'

type ClientConfig = {
  basePath: string
  configurationParameters?: ConfigurationParameters
  axios?: AxiosInstance
}

export const createFormsClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig) => {
  const configuration = new Configuration(configurationParameters)
  const args = [configuration, basePath, axios] as const

  return {
    ...ADMINApiFactory(...args),
    ...ConvertApiFactory(...args),
    ...FilesApiFactory(...args),
    ...FormsApiFactory(...args),
    ...GinisApiFactory(...args),
    ...HealthcheckApiFactory(...args),
    ...NasesApiFactory(...args),
    ...SignerApiFactory(...args),
    ...StatusesApiFactory(...args),
  }
}
