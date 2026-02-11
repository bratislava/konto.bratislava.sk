import { CityAccountClient, createCityAccountClient } from 'openapi-clients/city-account'

import { axiosInstance, ClientWithCustomConfig } from '@/clients/axios-instance'
import { environment } from '@/environment'

export const cityAccountClient = createCityAccountClient({
  basePath: environment.cityAccountUrl,
  axios: axiosInstance,
}) as ClientWithCustomConfig<CityAccountClient>

// Alias for better readability
export { UpsertUserRecordClientRequestDtoLoginClientEnum as LoginClientEnum } from 'openapi-clients/city-account'
