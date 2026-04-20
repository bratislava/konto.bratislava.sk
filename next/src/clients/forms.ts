import { createFormsClient, FormsClient } from 'openapi-clients/forms'

import { axiosInstance, ClientWithCustomConfig } from '@/src/clients/axios-instance'
import { environment } from '@/src/environment'

export const formsClient = createFormsClient({
  basePath: environment.formsUrl,
  axios: axiosInstance,
}) as ClientWithCustomConfig<FormsClient>
