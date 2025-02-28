import { AdminApiFactory, DefaultApiFactory, PaymentApiFactory, TaxApiFactory } from './api'
import { Configuration } from './configuration'
import type { AxiosInstance } from 'axios'

export const createTaxClient = (
  configuration: Configuration = {} as Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) => {
  const args = [configuration, basePath, axios] as const

  return {
    ...AdminApiFactory(...args),
    ...DefaultApiFactory(...args),
    ...PaymentApiFactory(...args),
    ...TaxApiFactory(...args),
  }
}
