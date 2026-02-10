import { createFormsClient, FormsClient } from 'openapi-clients/forms'

import { axiosInstance, ClientWithCustomConfig } from '@/clients/axios-instance'
import { environment } from '@/environment'

export const formsClient = createFormsClient({
  basePath: environment.formsUrl,
  axios: axiosInstance,
}) as ClientWithCustomConfig<FormsClient>
