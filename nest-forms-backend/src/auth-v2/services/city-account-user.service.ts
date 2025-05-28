import { Injectable } from '@nestjs/common'
import {
  ResponseLegalPersonDataDto,
  ResponseUserDataDto,
} from 'openapi-clients/city-account'

import ClientsService from '../../clients/clients.service'

export type CityAccountUser = ResponseLegalPersonDataDto | ResponseUserDataDto

@Injectable()
export class CityAccountUserService {
  constructor(private readonly clientsService: ClientsService) {}

  async getUser(bearerToken: string): Promise<CityAccountUser> {
    const response =
      await this.clientsService.cityAccountApi.userControllerGetOrCreateUser({
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      })

    return response.data
  }
}
