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
import { Configuration } from './configuration'
import type { AxiosInstance } from 'axios'

export const createFormsClient = (
  configuration: Configuration = {} as Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) => {
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
