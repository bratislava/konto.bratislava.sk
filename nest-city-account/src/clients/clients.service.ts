import { Injectable } from '@nestjs/common'
import { createMagproxyClient, type MagproxyClient } from 'openapi-clients/magproxy'
import { createSlovenskoSkClient, type SlovenskoSkClient } from 'openapi-clients/slovensko-sk'

import BaConfigService from '../config/ba-config.service'

@Injectable()
export default class ClientsService {
  public readonly magproxyApi: MagproxyClient

  public readonly slovenskoSkApi: SlovenskoSkClient

  constructor(private baConfigService: BaConfigService) {
    this.magproxyApi = createMagproxyClient({
      basePath: this.baConfigService.magproxy.url,
    })

    this.slovenskoSkApi = createSlovenskoSkClient({
      basePath: this.baConfigService.nases.containerUri,
    })
  }
}
