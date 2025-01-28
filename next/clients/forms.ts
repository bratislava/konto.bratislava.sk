import { environment } from '../environment'
import { axiosInstance } from './axios-instance'
import {
  Configuration,
  ConvertApiFactory,
  FilesApiFactory,
  GinisApiFactory,
  NasesApiFactory,
  SignerApiFactory,
  StatusesApiFactory,
} from './openapi-forms'

const args = [{} as Configuration, environment.formsUrl, axiosInstance] as const

export const formsApi = {
  ...ConvertApiFactory(...args),
  ...FilesApiFactory(...args),
  ...StatusesApiFactory(...args),
  ...NasesApiFactory(...args),
  ...GinisApiFactory(...args),
  ...SignerApiFactory(...args),
}
