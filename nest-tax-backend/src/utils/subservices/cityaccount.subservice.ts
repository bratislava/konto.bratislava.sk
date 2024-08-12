import { HttpStatus, Injectable, Logger } from '@nestjs/common'

import {
  ADMINApi as AdminApi,
  Configuration,
  ResponseUserByBirthNumberDto,
} from '../../generated-clients/nest-city-account'

@Injectable()
export class CityAccountSubservice {
  private cityAccountApi: AdminApi

  private logger: Logger

  constructor() {
    this.cityAccountApi = new AdminApi(
      new Configuration({}),
      process.env.CITY_ACCOUNT_API_URL,
    )
    this.logger = new Logger('CityAccountSubservice')
  }

  async getUserDataAdmin(
    birthNumber: string,
  ): Promise<ResponseUserByBirthNumberDto | null> {
    const birthNumberWithoutSlash = birthNumber.replace('/', '')
    try {
      const user =
        await this.cityAccountApi.adminControllerGetUserDataByBirthNumber(
          birthNumberWithoutSlash,
          {
            headers: {
              apiKey: process.env.CITY_ACCOUNT_ADMIN_API_KEY,
            },
          },
        )
      if (user.data.birthNumber) {
        return user.data
      }
      return null
    } catch (error) {
      // Since we add all taxes from noris, not only for people in city account, we shall not log errors
      // when the people do not exist in city account, or their birth number is in bad format for city account.
      if (
        error.response?.status === HttpStatus.NOT_FOUND ||
        error.response?.status === HttpStatus.BAD_REQUEST
      ) {
        return null
      }
      this.logger.error(`error to get birthnumber: ${<string>error}`)
      return null
    }
  }
}
