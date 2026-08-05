import {
  ADMINApiFactory,
  AuthApiFactory,
  BackendIntegrationAPIApiFactory,
  DPBApiFactory,
  DefaultApiFactory,
  OAuth2ApiFactory,
  PAASMPAApiFactory,
  TowingApiFactory,
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

export interface CityAccountClient
  extends
    ReturnType<typeof ADMINApiFactory>,
    ReturnType<typeof AuthApiFactory>,
    ReturnType<typeof BackendIntegrationAPIApiFactory>,
    ReturnType<typeof DPBApiFactory>,
    ReturnType<typeof DefaultApiFactory>,
    ReturnType<typeof OAuth2ApiFactory>,
    ReturnType<typeof PAASMPAApiFactory>,
    ReturnType<typeof TowingApiFactory>,
    ReturnType<typeof UserIntegrationApiFactory>,
    ReturnType<typeof UserVerificationsApiFactory>,
    ReturnType<typeof UsersManipulationApiFactory> {}

export const createCityAccountClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig): CityAccountClient => {
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
    ...TowingApiFactory(...args),
    ...UserIntegrationApiFactory(...args),
    ...UserVerificationsApiFactory(...args),
    ...UsersManipulationApiFactory(...args),
  } satisfies CityAccountClient
}
