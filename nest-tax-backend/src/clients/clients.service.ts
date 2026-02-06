import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  type CityAccountClient,
  createCityAccountClient,
} from 'openapi-clients/city-account'

@Injectable()
export default class ClientsService {
  constructor(private readonly configService: ConfigService) {}

  public readonly cityAccountApi: CityAccountClient = createCityAccountClient({
    basePath: this.configService.getOrThrow('CITY_ACCOUNT_API_URL'),
  })
}
