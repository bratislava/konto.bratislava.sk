import {
  createParamDecorator,
  ExecutionContext,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import express from 'express'
import {
  ResponseLegalPersonDataDto,
  ResponseUserDataDto,
} from 'openapi-clients/city-account'

import ClientsService from '../../clients/clients.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { isAxiosError } from 'axios'
import { ErrorsEnum } from '../../utils/global-enums/errors.enum'

/**
 * This is a temporary solution. It's not possible to distinguish between ResponseLegalPersonDataDto
 * and ResponseUserDataDto because there's no type-specific property to create a type guard.
 *
 * TODO: https://github.com/bratislava/private-konto.bratislava.sk/issues/863
 */
export type UserInfoResponse =
  | // Common properties (required)
  ({
      [K in keyof ResponseLegalPersonDataDto & keyof ResponseUserDataDto]:
        | ResponseLegalPersonDataDto[K]
        | ResponseUserDataDto[K]
    } & {
      // Properties only in ResponseLegalPersonDataDto (partial)
      [K in Exclude<
        keyof ResponseLegalPersonDataDto,
        keyof ResponseUserDataDto
      >]?: ResponseLegalPersonDataDto[K]
    } & {
      // Properties only in ResponseUserDataDto (partial)
      [K in Exclude<
        keyof ResponseUserDataDto,
        keyof ResponseLegalPersonDataDto
      >]?: ResponseUserDataDto[K]
    })
  | null

@Injectable()
export class UserInfoPipe implements PipeTransform {
  constructor(private clientsService: ClientsService) {}

  async transform(value: string | undefined): Promise<UserInfoResponse> {
    if (value == null) {
      return null
    }

    try {
      const response =
        await this.clientsService.cityAccountApi.userControllerGetOrCreateUser({
          headers: {
            Authorization: value,
          },
        })
      return response.data
    } catch (error) {
      const thrower = new ThrowerErrorGuard()
      if (!isAxiosError(error)) {
        throw thrower.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Internal error occurred while trying to fetch user from City Account',
          error,
        )
      }
      // The Authorization header is the end user's bearer token, so 401/403
      // from city-account mean the user's token is bad. Surface them as-is
      // instead of letting fromAxiosError's default treat them as our own
      // credentials failing (BAD_GATEWAY_AUTH_ERROR, which alerts).
      throw thrower.fromAxiosError(error, {
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

const GetUserToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<express.Request>()
    return request.headers.authorization
  },
)

export const UserInfo = (): ParameterDecorator =>
  GetUserToken(undefined, UserInfoPipe)
