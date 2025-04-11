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
  UserControllerGetOrCreateUser200Response,
} from 'openapi-clients/city-account'

import ClientsService from '../../clients/clients.service'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../../nases/nases.errors.enum'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'

export type UserInfoResponse =
  | (ResponseLegalPersonDataDto & ResponseUserDataDto)
  | null

@Injectable()
export class UserInfoPipe implements PipeTransform {
  constructor(private clientsService: ClientsService) {}

  async transform(
    value: string | undefined,
  ): Promise<UserControllerGetOrCreateUser200Response | null> {
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

export const UserInfo = (options?: unknown): ParameterDecorator =>
  GetUserToken(options, UserInfoPipe)
