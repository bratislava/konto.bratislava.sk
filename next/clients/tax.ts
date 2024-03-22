import { environment } from '../environment'
import { axiosInstance } from './axios-instance'
import {
  AdminApiFactory,
  Configuration,
  DefaultApiFactory,
  PaymentApiFactory,
  TaxApiFactory,
} from './openapi-tax'

const args = [{} as Configuration, environment.taxesUrl, axiosInstance] as const

export const taxApi = {
  ...AdminApiFactory(...args),
  ...DefaultApiFactory(...args),
  ...PaymentApiFactory(...args),
  ...TaxApiFactory(...args),
}
