import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createFormsClient, type FormsClient } from 'openapi-clients/forms'

@Injectable()
export default class ClientsService {
  constructor(private readonly configService: ConfigService) {}

  public readonly formsApi: FormsClient = createFormsClient({
    basePath: this.configService.getOrThrow('NEST_FORMS_BACKEND'),
  })
}
