import { Injectable } from '@nestjs/common'
import { createFormsClient, type FormsClient } from 'openapi-clients/forms'

import BaConfigService from '../config/ba-config.service'

@Injectable()
export default class ClientsService {
  public readonly formsApi: FormsClient

  constructor(private readonly baConfigService: BaConfigService) {
    this.formsApi = createFormsClient({
      basePath: this.baConfigService.formsBackend.url,
    })
  }
}
