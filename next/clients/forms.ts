import { createFormsClient } from 'openapi-clients/forms'

import { environment } from '../environment'
import { axiosInstance } from './axios-instance'

export const formsClient = createFormsClient({
  basePath: environment.formsUrl,
  axios: axiosInstance,
})
