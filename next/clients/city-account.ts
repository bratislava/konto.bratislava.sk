import { createCityAccountClient } from 'openapi-clients/city-account'

import { environment } from '../environment'
import { axiosInstance } from './axios-instance'

export const cityAccountApi = createCityAccountClient({}, environment.cityAccountUrl, axiosInstance)
