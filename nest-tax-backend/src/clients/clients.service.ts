import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createCityAccountClient } from 'openapi-clients/city-account'

@Injectable()
export default class ClientsService {
  constructor(private readonly configService: ConfigService) {}

  // Without explicit type TypeScript throws TS2742 error
  public readonly cityAccountApi: ReturnType<typeof createCityAccountClient> =
    createCityAccountClient({
      basePath: this.configService.getOrThrow('CITY_ACCOUNT_API_URL'),
    })
}
