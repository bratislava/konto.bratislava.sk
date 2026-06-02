import {
  createParamDecorator,
  ExecutionContext,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import express from 'express'

import ClientsService from '../../clients/clients.service'
import { addSlashToBirthNumber } from '../../utils/functions/birthNumber'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { isAxiosError } from 'axios'

@Injectable()
export class UserInfoPipe implements PipeTransform {
  constructor(private readonly clientsService: ClientsService) {}

  async transform(value: string | undefined) {
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
      const user = response.data

      if (user.birthNumber) {
        const birthNumberWithSlash: string = addSlashToBirthNumber(
          user.birthNumber,
        )
        return { ...user, birthNumber: birthNumberWithSlash }
      }
      throw new Error('Birth number is missing')
    } catch (error) {
      const thrower = new ThrowerErrorGuard()
      if (!isAxiosError(error)) {
        throw thrower.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Get or create user error: ${String(error)}`,
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

export const BratislavaUser = (): ParameterDecorator =>
  GetUserToken(undefined, UserInfoPipe)
