import { Injectable } from '@nestjs/common'
import { createCityAccountClient } from 'openapi-clients/city-account'
import { createSlovenskoSkClient } from 'openapi-clients/slovensko-sk'

import BaConfigService from '../config/ba-config.service'

@Injectable()
export default class ClientsService {
  constructor(private readonly baConfigService: BaConfigService) {}

  public readonly slovenskoSkApi = createSlovenskoSkClient({
    basePath: this.baConfigService.slovenskoSk.url,
  })

  public readonly cityAccountApi = createCityAccountClient({
    basePath: this.baConfigService.cityAccountBackend.url,
  })
}
