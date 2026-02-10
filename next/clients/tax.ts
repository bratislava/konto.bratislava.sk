import { createTaxClient, TaxClient } from 'openapi-clients/tax'

import { environment } from '@/environment'

import { axiosInstance, ClientWithCustomConfig } from './axios-instance'

export const taxClient = createTaxClient({
  basePath: environment.taxesUrl,
  axios: axiosInstance,
}) as ClientWithCustomConfig<TaxClient>
