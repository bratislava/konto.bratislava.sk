import { environment } from '../environment'
import { axiosInstance } from './axios-instance'
import {
  Configuration,
  DefaultApiFactory,
  FilesApiFactory,
  NasesApiFactory,
  StatusesApiFactory,
} from './openapi-forms'

const args = [{} as Configuration, environment.formsUrl, axiosInstance] as const

export const formsApi = {
  ...DefaultApiFactory(...args),
  ...FilesApiFactory(...args),
  ...StatusesApiFactory(...args),
  ...NasesApiFactory(...args),
}
