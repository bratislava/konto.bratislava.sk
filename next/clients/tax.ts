import { createTaxClient } from 'openapi-clients/tax'

import { environment } from '../environment'
import { axiosInstance } from './axios-instance'

export const taxClient = createTaxClient({
  basePath: environment.taxesUrl,
  axios: axiosInstance,
})
