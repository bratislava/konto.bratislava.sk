import { Injectable } from '@nestjs/common'
import {
  type CityAccountClient,
  createCityAccountClient,
} from 'openapi-clients/city-account'

import BaConfigService from '../config/ba-config.service'

@Injectable()
export default class ClientsService {
  public readonly cityAccountApi: CityAccountClient

  constructor(private readonly baConfigService: BaConfigService) {
    this.cityAccountApi = createCityAccountClient({
      basePath: this.baConfigService.cityAccountBackend.url,
    })
  }
}
