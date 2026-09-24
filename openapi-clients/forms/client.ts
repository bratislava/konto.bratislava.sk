import {
  ADMINApiFactory,
  ConvertApiFactory,
  FilesApiFactory,
  FormMigrationsApiFactory,
  FormSenderApiFactory,
  FormsApiFactory,
  FormsV2ApiFactory,
  GinisApiFactory,
  HealthcheckApiFactory,
  SignerApiFactory,
  StatusesApiFactory,
  WebhookApiFactory,
} from './api'
import { Configuration, ConfigurationParameters } from './configuration'
import type { AxiosInstance } from 'axios'

type ClientConfig = {
  basePath: string
  configurationParameters?: ConfigurationParameters
  axios?: AxiosInstance
}

export interface FormsClient
  extends
    ReturnType<typeof ADMINApiFactory>,
    ReturnType<typeof ConvertApiFactory>,
    ReturnType<typeof FilesApiFactory>,
    ReturnType<typeof FormMigrationsApiFactory>,
    ReturnType<typeof FormSenderApiFactory>,
    ReturnType<typeof FormsApiFactory>,
    ReturnType<typeof FormsV2ApiFactory>,
    ReturnType<typeof GinisApiFactory>,
    ReturnType<typeof HealthcheckApiFactory>,
    ReturnType<typeof SignerApiFactory>,
    ReturnType<typeof StatusesApiFactory>,
    ReturnType<typeof WebhookApiFactory> {}

export const createFormsClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig): FormsClient => {
  const configuration = new Configuration(configurationParameters)
  const args = [configuration, basePath, axios] as const

  return {
    ...ADMINApiFactory(...args),
    ...ConvertApiFactory(...args),
    ...FilesApiFactory(...args),
    ...FormMigrationsApiFactory(...args),
    ...FormSenderApiFactory(...args),
    ...FormsApiFactory(...args),
    ...FormsV2ApiFactory(...args),
    ...GinisApiFactory(...args),
    ...HealthcheckApiFactory(...args),
    ...SignerApiFactory(...args),
    ...StatusesApiFactory(...args),
    ...WebhookApiFactory(...args),
  } satisfies FormsClient
}
