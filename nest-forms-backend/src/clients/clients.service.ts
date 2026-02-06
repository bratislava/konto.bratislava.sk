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
  constructor(private readonly baConfigService: BaConfigService) {}

  public readonly slovenskoSkApi: SlovenskoSkClient = createSlovenskoSkClient({
    basePath: this.baConfigService.slovenskoSk.url,
  })

  public readonly cityAccountApi: CityAccountClient = createCityAccountClient({
    basePath: this.baConfigService.cityAccountBackend.url,
  })
}
