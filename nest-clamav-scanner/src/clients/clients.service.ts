import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createFormsClient } from 'openapi-clients/forms'

@Injectable()
export default class ClientsService {
  constructor(private readonly configService: ConfigService) {}

  // Without explicit type TypeScript throws TS2742 error
  public readonly formsApi: ReturnType<typeof createFormsClient> =
    createFormsClient({
      basePath: this.configService.getOrThrow('NEST_FORMS_BACKEND'),
    })
}
