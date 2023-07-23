import { environment } from '../environment'
import { axiosInstance } from './axios-instance';
import { AdminApiFactory,Configuration, DefaultApiFactory, PaymentApiFactory, TaxApiFactory } from "./openapi-tax"

const args = [
  {} as Configuration,
  environment.cityAccountUrl,
  axiosInstance,
] as const

export const taxApi = {
  ...DefaultApiFactory(...args),
  ...PaymentApiFactory(...args),
  ...TaxApiFactory(...args),
  ...AdminApiFactory(...args)
}