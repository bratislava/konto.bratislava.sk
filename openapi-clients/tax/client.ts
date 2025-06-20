import {
  AdminApiFactory,
  CardPaymentReportingApiFactory,
  DefaultApiFactory,
  PaymentApiFactory,
  TaxApiFactory,
} from './api'
import { Configuration, ConfigurationParameters } from './configuration'
import type { AxiosInstance } from 'axios'

type ClientConfig = {
  basePath: string
  configurationParameters?: ConfigurationParameters
  axios?: AxiosInstance
}

export type TaxClient = ReturnType<typeof createTaxClient>

export const createTaxClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig) => {
  const configuration = new Configuration(configurationParameters)
  const args = [configuration, basePath, axios] as const

  return {
    ...AdminApiFactory(...args),
    ...CardPaymentReportingApiFactory(...args),
    ...DefaultApiFactory(...args),
    ...PaymentApiFactory(...args),
    ...TaxApiFactory(...args),
  }
}
