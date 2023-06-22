import { axiosInstance } from './axios-instance'
import {
  Configuration,
  DefaultApiFactory,
  FilesApiFactory,
  NasesApiFactory,
  StatusesApiFactory,
} from './openapi-forms'

const args = [
  {} as Configuration,
  String(process.env.NEXT_PUBLIC_FORMS_URL),
  axiosInstance,
] as const

export const formsApi = {
  ...DefaultApiFactory(...args),
  ...FilesApiFactory(...args),
  ...StatusesApiFactory(...args),
  ...NasesApiFactory(...args),
}
