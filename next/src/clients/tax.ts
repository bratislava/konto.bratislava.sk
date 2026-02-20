import { createTaxClient, TaxClient } from 'openapi-clients/tax'

import { axiosInstance, ClientWithCustomConfig } from '@/src/clients/axios-instance'
import { environment } from '@/src/environment'

export const taxClient = createTaxClient({
  basePath: environment.taxesUrl,
  axios: axiosInstance,
}) as ClientWithCustomConfig<TaxClient>
