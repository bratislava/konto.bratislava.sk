import {
  ADMINApiFactory,
  AuthApiFactory,
  DefaultApiFactory,
  UserVerificationsApiFactory,
  UsersManipulationApiFactory,
} from './api'
import { Configuration } from './configuration'
import type { AxiosInstance } from 'axios'

export const createCityAccountClient = (
  configuration: Configuration = {} as Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) => {
  const args = [configuration, basePath, axios] as const

  return {
    ...ADMINApiFactory(...args),
    ...AuthApiFactory(...args),
    ...DefaultApiFactory(...args),
    ...UserVerificationsApiFactory(...args),
    ...UsersManipulationApiFactory(...args),
  }
}
