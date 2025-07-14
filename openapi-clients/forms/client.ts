import {
  ADMINApiFactory,
  ConvertApiFactory,
  FilesApiFactory,
  FormMigrationsApiFactory,
  FormsApiFactory,
  FormsV2ApiFactory,
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

export type FormsClient = ReturnType<typeof createFormsClient>

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
    ...FormMigrationsApiFactory(...args),
    ...FormsApiFactory(...args),
    ...FormsV2ApiFactory(...args),
    ...GinisApiFactory(...args),
    ...HealthcheckApiFactory(...args),
    ...NasesApiFactory(...args),
    ...SignerApiFactory(...args),
    ...StatusesApiFactory(...args),
  }
}
