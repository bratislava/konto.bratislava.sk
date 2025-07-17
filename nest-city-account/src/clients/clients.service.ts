import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTaxClient } from 'openapi-clients/tax'
import { createMagproxyClient } from 'openapi-clients/magproxy'

@Injectable()
export default class ClientsService {
  constructor(private configService: ConfigService) {}

  public readonly taxBackendApi = createTaxClient({
    basePath: this.configService.getOrThrow('TAX_BACKEND_URL'),
  })

  public readonly magproxyApi = createMagproxyClient({
    basePath: this.configService.getOrThrow('MAGPROXY_URL'),
  })
}
