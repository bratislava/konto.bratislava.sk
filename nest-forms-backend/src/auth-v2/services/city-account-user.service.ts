import { HttpStatus, Injectable } from '@nestjs/common'
import { isAxiosError } from 'axios'
import {
  ResponseLegalPersonDataDto,
  ResponseUserDataDto,
} from 'openapi-clients/city-account'

import ClientsService from '../../clients/clients.service'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'

export type CityAccountUser = ResponseLegalPersonDataDto | ResponseUserDataDto

@Injectable()
export class CityAccountUserService {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  async getUser(bearerToken: string): Promise<CityAccountUser> {
    try {
      const response =
        await this.clientsService.cityAccountApi.userControllerGetOrCreateUser({
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        })

      return response.data
    } catch (error) {
      if (!isAxiosError(error)) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
          'Internal error occurred while trying to fetch user from City Account',
          error,
        )
      }
      // The Authorization header is the end user's bearer token, so 401/403
      // from city-account mean the user's token is bad. Surface them as-is
      // instead of letting fromAxiosError's default treat them as our own
      // credentials failing (BAD_GATEWAY_AUTH_ERROR, which alerts).
      throw this.throwerErrorGuard.fromAxiosError(error, {
        statusOverrides: {
          [HttpStatus.UNAUTHORIZED]: {
            status: HttpStatus.UNAUTHORIZED,
            errorEnum: ErrorsEnum.UNAUTHORIZED_ERROR,
            message: 'The provided authorization token is invalid or expired.',
          },
          [HttpStatus.FORBIDDEN]: {
            status: HttpStatus.FORBIDDEN,
            errorEnum: ErrorsEnum.FORBIDDEN_ERROR,
            message:
              'The provided authorization token is not allowed to get or create this user.',
          },
          [HttpStatus.NOT_FOUND]: {
            status: HttpStatus.BAD_REQUEST,
            errorEnum: ErrorsEnum.BAD_REQUEST_ERROR,
            message:
              'User could not be retrieved or created from city account.',
          },
        },
      })
    }
  }
}
