import { createTaxClient, TaxClient } from 'openapi-clients/tax'

import { axiosInstance, ClientWithCustomConfig } from '@/clients/axios-instance'
import { environment } from '@/environment'

export const taxClient = createTaxClient({
  basePath: environment.taxesUrl,
  axios: axiosInstance,
}) as ClientWithCustomConfig<TaxClient>
