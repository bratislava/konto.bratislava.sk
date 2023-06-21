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

export const defaultApi = DefaultApiFactory(...args)
export const filesApi = FilesApiFactory(...args)
export const statusesApi = StatusesApiFactory(...args)
export const nasesApi = NasesApiFactory(...args)
