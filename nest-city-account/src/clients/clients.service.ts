import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createMagproxyClient, type MagproxyClient } from 'openapi-clients/magproxy'
import { createSlovenskoSkClient, type SlovenskoSkClient } from 'openapi-clients/slovensko-sk'
import { createTaxClient, type TaxClient } from 'openapi-clients/tax'

@Injectable()
export default class ClientsService {
  constructor(private configService: ConfigService) {}

  public readonly taxBackendApi: TaxClient = createTaxClient({
    basePath: this.configService.getOrThrow('TAX_BACKEND_URL'),
  })

  public readonly magproxyApi: MagproxyClient = createMagproxyClient({
    basePath: this.configService.getOrThrow('MAGPROXY_URL'),
  })

  public readonly slovenskoSkApi: SlovenskoSkClient = createSlovenskoSkClient({
    basePath: this.configService.getOrThrow('SLOVENSKO_SK_CONTAINER_URI'),
  })
}
