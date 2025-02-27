import {
  ADMINApiFactory,
  AuthApiFactory,
  Configuration,
  DefaultApiFactory,
  UsersManipulationApiFactory,
  UserVerificationsApiFactory,
} from 'openapi-clients/city-account'

import { environment } from '../environment'
import { axiosInstance } from './axios-instance'

const args = [{} as Configuration, environment.cityAccountUrl, axiosInstance] as const

export const cityAccountApi = {
  ...DefaultApiFactory(...args),
  ...ADMINApiFactory(...args),
  ...AuthApiFactory(...args),
  ...UsersManipulationApiFactory(...args),
  ...UserVerificationsApiFactory(...args),
}
