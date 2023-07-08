import { axiosInstance } from './axios-instance';
import {
  ADMINApiFactory,
  AuthApiFactory,
  Configuration,
  DefaultApiFactory,
  UsersManipulationApiFactory,
  UserVerificationsApiFactory
} from './openapi-city-account';


const args = [
  {} as Configuration,
  // eslint-disable-next-line no-process-env
  String(process.env.NEXT_PUBLIC_FORMS_URL),
  axiosInstance,
] as const

export const formsApi = {
  ...DefaultApiFactory(...args),
  ...ADMINApiFactory(...args),
  ...AuthApiFactory(...args),
  ...UsersManipulationApiFactory(...args),
  ...UserVerificationsApiFactory(...args),
}
