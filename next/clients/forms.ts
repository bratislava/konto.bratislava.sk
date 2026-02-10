import { createFormsClient, FormsClient } from 'openapi-clients/forms'

import { environment } from '@/environment'

import { axiosInstance, ClientWithCustomConfig } from './axios-instance'

export const formsClient = createFormsClient({
  basePath: environment.formsUrl,
  axios: axiosInstance,
}) as ClientWithCustomConfig<FormsClient>
