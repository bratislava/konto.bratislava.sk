import { Injectable } from '@nestjs/common'
import {
  UpvsCorporateBody,
  UpvsNaturalPerson,
} from 'openapi-clients/slovensko-sk'

import ClientsService from '../clients/clients.service'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@Injectable()
export default class NasesService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private readonly clientsService: ClientsService,
  ) {
    this.logger = new LineLoggerSubservice('NasesService')
  }

  async getUpvsIdentity(
    token: string,
  ): Promise<UpvsNaturalPerson | UpvsCorporateBody | null> {
    // there is a bug in the container and function `apiUpvsIdentityGet` below, according to 'openapi-clients/slovensko-sk' types
    // returns information about UpvsNaturalPerson,
    // in reality it returns information about UpvsCorporateBody as well
    // after https://github.com/slovensko-digital/slovensko-sk-api/pull/115 is merged, typing can be erased
    const result = await this.clientsService.slovenskoSkApi
      .apiUpvsIdentityGet({
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => response.data)
      .catch((error: unknown) => {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            'Failed to get nases identity, verify if this is because of invalid token or a server issue',
            undefined,
            error,
          ),
        )
        return null
      })
    return result
  }
}
