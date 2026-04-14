import { Injectable } from '@nestjs/common'
import {
  type CityAccountClient,
  createCityAccountClient,
} from 'openapi-clients/city-account'
import {
  createSlovenskoSkClient,
  type SlovenskoSkClient,
} from 'openapi-clients/slovensko-sk'

import BaConfigService from '../config/ba-config.service'

@Injectable()
export default class ClientsService {
  public readonly slovenskoSkApi: SlovenskoSkClient

  public readonly cityAccountApi: CityAccountClient

  constructor(private readonly baConfigService: BaConfigService) {
    this.slovenskoSkApi = createSlovenskoSkClient({
      basePath: this.baConfigService.slovenskoSk.url,
    })

    this.cityAccountApi = createCityAccountClient({
      basePath: this.baConfigService.cityAccountBackend.url,
    })
  }
}
