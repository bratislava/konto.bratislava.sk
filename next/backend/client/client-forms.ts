import {
  Configuration,
  DefaultApiFactory,
  FilesApiFactory,
  NasesApiFactory,
  StatusesApiFactory,
} from '@backend/client-openapi-forms'
import { axiosInstance } from '@backend/utils/axios-instance'

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
