import { CityAccountClient, createCityAccountClient } from 'openapi-clients/city-account'

import { environment } from '../environment'
import { axiosInstance, ClientWithCustomConfig } from './axios-instance'

export const cityAccountClient = createCityAccountClient({
  basePath: environment.cityAccountUrl,
  axios: axiosInstance,
}) as ClientWithCustomConfig<CityAccountClient>

// Alias for better readability
export { RegisterLoginClientRequestDtoLoginClientEnum as LoginClientEnum } from 'openapi-clients/city-account'
