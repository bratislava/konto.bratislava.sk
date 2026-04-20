import {
  ADMINApiFactory,
  AuthApiFactory,
  BackendIntegrationAPIApiFactory,
  DPBApiFactory,
  DefaultApiFactory,
  OAuth2ApiFactory,
  PAASMPAApiFactory,
  UserIntegrationApiFactory,
  UserVerificationsApiFactory,
  UsersManipulationApiFactory,
} from './api'
import { Configuration, ConfigurationParameters } from './configuration'
import type { AxiosInstance } from 'axios'

type ClientConfig = {
  basePath: string
  configurationParameters?: ConfigurationParameters
  axios?: AxiosInstance
}

export type CityAccountClient = ReturnType<typeof createCityAccountClient>

export const createCityAccountClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig) => {
  const configuration = new Configuration(configurationParameters)
  const args = [configuration, basePath, axios] as const

  return {
    ...ADMINApiFactory(...args),
    ...AuthApiFactory(...args),
    ...BackendIntegrationAPIApiFactory(...args),
    ...DPBApiFactory(...args),
    ...DefaultApiFactory(...args),
    ...OAuth2ApiFactory(...args),
    ...PAASMPAApiFactory(...args),
    ...UserIntegrationApiFactory(...args),
    ...UserVerificationsApiFactory(...args),
    ...UsersManipulationApiFactory(...args),
  }
}
