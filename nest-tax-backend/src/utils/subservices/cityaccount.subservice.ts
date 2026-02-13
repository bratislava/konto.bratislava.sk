import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'

import ClientsService from '../../clients/clients.service'
import { addSlashToBirthNumber } from '../functions/birthNumber'
import { ErrorsEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'

@Injectable()
export class CityAccountSubservice {
  private readonly logger: Logger

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly clientsService: ClientsService,
  ) {
    this.logger = new Logger('CityAccountSubservice')
  }

  async getUserDataAdmin(
    birthNumber: string,
  ): Promise<ResponseUserByBirthNumberDto | null> {
    const birthNumberWithoutSlash = birthNumber.replace('/', '')
    try {
      const user =
        await this.clientsService.cityAccountApi.integrationControllerGetUserDataByBirthNumber(
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
        (error as AxiosError).response?.status === HttpStatus.NOT_FOUND ||
        (error as AxiosError).response?.status === HttpStatus.BAD_REQUEST
      ) {
        return null
      }
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Failed to get birthnumber:`,
          undefined,
          undefined,
          error,
        ),
      )
      return null
    }
  }

  async getUserDataAdminBatch(
    birthNumbers: string[],
  ): Promise<Record<string, ResponseUserByBirthNumberDto>> {
    const birthNumbersWithoutSlash = birthNumbers.map((birthNumber) =>
      birthNumber.replaceAll('/', ''),
    )
    const userDataResult =
      await this.clientsService.cityAccountApi.integrationControllerGetUserDataByBirthNumbersBatch(
        { birthNumbers: birthNumbersWithoutSlash },
        {
          headers: {
            apiKey: process.env.CITY_ACCOUNT_ADMIN_API_KEY,
          },
        },
      )

    const result: Record<string, ResponseUserByBirthNumberDto> = {}
    Object.keys(userDataResult.data.users).forEach((birthNumber) => {
      const modifiedKey = addSlashToBirthNumber(birthNumber)
      result[modifiedKey] = userDataResult.data.users[birthNumber]
    })

    return result
  }

  async getNewUserBirtNumbersAdminBatch(
    since: Date,
    take?: number,
  ): Promise<{ birthNumbers: string[]; nextSince: Date }> {
    try {
      const requestResult =
        await this.clientsService.cityAccountApi.integrationControllerGetNewVerifiedUsersBirthNumbers(
          { since: since.toISOString(), take },
          {
            headers: {
              apiKey: process.env.CITY_ACCOUNT_ADMIN_API_KEY,
            },
          },
        )
      const birthNumbers = requestResult.data.birthNumbers.map((bn) =>
        addSlashToBirthNumber(bn),
      )
      return { birthNumbers, nextSince: new Date(requestResult.data.nextSince) }
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to get birth numbers for new verified user accounts.',
        undefined,
        undefined,
        error,
      )
    }
  }
}
