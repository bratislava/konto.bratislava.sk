import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import express from 'express'
import {
  ResponseLegalPersonDataDto,
  ResponseUserDataDto,
} from 'openapi-clients/city-account'

import ClientsService from '../../clients/clients.service'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../../nases/nases.errors.enum'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'

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
      throw thrower.NotFoundException(
        NasesErrorsEnum.CITY_ACCOUNT_USER_GET_ERROR,
        `${NasesErrorsResponseEnum.CITY_ACCOUNT_USER_GET_ERROR} error: ${String(error)}`,
      )
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
