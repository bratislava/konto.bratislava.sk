import {
  ADMINApiFactory,
  AppApiFactory,
  AuthApiFactory,
  BackendIntegrationAPIApiFactory,
  DPBApiFactory,
  OAuth2ApiFactory,
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
    ...AppApiFactory(...args),
    ...AuthApiFactory(...args),
    ...BackendIntegrationAPIApiFactory(...args),
    ...DPBApiFactory(...args),
    ...OAuth2ApiFactory(...args),
    ...UserIntegrationApiFactory(...args),
    ...UserVerificationsApiFactory(...args),
    ...UsersManipulationApiFactory(...args),
  }
}
