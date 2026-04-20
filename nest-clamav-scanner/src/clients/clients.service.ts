import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createFormsClient, type FormsClient } from 'openapi-clients/forms'

@Injectable()
export default class ClientsService {
  public readonly formsApi: FormsClient

  constructor(private readonly configService: ConfigService) {
    this.formsApi = createFormsClient({
      basePath: this.configService.getOrThrow('NEST_FORMS_BACKEND'),
    })
  }
}
