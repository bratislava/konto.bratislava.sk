import { Injectable } from '@nestjs/common'

import ClientsService from '../../clients/clients.service'

@Injectable()
export class CityAccountUserService {
  constructor(private readonly clientsService: ClientsService) {}

  async getUser(bearerToken: string) {
    const response =
      await this.clientsService.cityAccountApi.userControllerGetOrCreateUser({
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      })

    return response.data
  }
}
