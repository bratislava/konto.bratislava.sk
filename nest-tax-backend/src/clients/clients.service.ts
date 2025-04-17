import { Injectable } from '@nestjs/common'
import { createCityAccountClient } from 'openapi-clients/city-account'

export const BASE_PATH = 'http://localhost:3000'.replace(/\/+$/, '')

@Injectable()
export default class ClientsService {
  // Without explicit type TypeScript throws TS2742 error
  public readonly cityAccountApi: ReturnType<typeof createCityAccountClient> =
    createCityAccountClient({
      basePath: process.env.CITY_ACCOUNT_API_URL ?? BASE_PATH,
    })
}
