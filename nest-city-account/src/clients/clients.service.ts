import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createMagproxyClient, type MagproxyClient } from 'openapi-clients/magproxy'
import { createSlovenskoSkClient, type SlovenskoSkClient } from 'openapi-clients/slovensko-sk'

@Injectable()
export default class ClientsService {
  public readonly magproxyApi: MagproxyClient

  public readonly slovenskoSkApi: SlovenskoSkClient

  constructor(private configService: ConfigService) {
    this.magproxyApi = createMagproxyClient({
      basePath: this.configService.getOrThrow('MAGPROXY_URL'),
    })

    this.slovenskoSkApi = createSlovenskoSkClient({
      basePath: this.configService.getOrThrow('SLOVENSKO_SK_CONTAINER_URI'),
    })
  }
}
