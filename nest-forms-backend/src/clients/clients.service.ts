import { Injectable } from '@nestjs/common'
import { createCityAccountClient } from 'openapi-clients/city-account'
import { createSlovenskoSkClient } from 'openapi-clients/slovensko-sk'

import BaConfigService from '../config/ba-config.service'

@Injectable()
export default class ClientsService {
  constructor(private readonly baConfigService: BaConfigService) {}

  // Without explicit type TypeScript throws TS2742 error
  public readonly slovenskoSkApi: ReturnType<typeof createSlovenskoSkClient> =
    createSlovenskoSkClient({
      basePath: this.baConfigService.slovenskoSk.url,
    })

  // Without explicit type TypeScript throws TS2742 error
  public readonly cityAccountApi: ReturnType<typeof createCityAccountClient> =
    createCityAccountClient({
      basePath: this.baConfigService.cityAccountBackend.url,
    })
}
