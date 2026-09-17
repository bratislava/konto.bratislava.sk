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

export interface TaxClient
  extends
    ReturnType<typeof AdminApiFactory>,
    ReturnType<typeof CardPaymentReportingApiFactory>,
    ReturnType<typeof DefaultApiFactory>,
    ReturnType<typeof PaymentApiFactory>,
    ReturnType<typeof TaxApiFactory> {}

export const createTaxClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig): TaxClient => {
  const configuration = new Configuration(configurationParameters)
  const args = [configuration, basePath, axios] as const

  return {
    ...AdminApiFactory(...args),
    ...CardPaymentReportingApiFactory(...args),
    ...DefaultApiFactory(...args),
    ...PaymentApiFactory(...args),
    ...TaxApiFactory(...args),
  } satisfies TaxClient
}
