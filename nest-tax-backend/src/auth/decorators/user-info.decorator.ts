import { ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'
import {
  createParamDecorator,
  ExecutionContext,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { isAxiosError } from 'axios'
import express from 'express'

import ClientsService from '../../clients/clients.service'
import alertReporting from '../../utils/constants/error.alerts'
import { addSlashToBirthNumber } from '../../utils/functions/birthNumber'

@Injectable()
export class UserInfoPipe implements PipeTransform {
  constructor(private readonly clientsService: ClientsService) {}

  async transform(value: string | undefined) {
    if (value == null) {
      return null
    }

    try {
      const response =
        await this.clientsService.cityAccountApi.userControllerUpsertUser({
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
      const errorFactoryService = new ErrorFactoryService({ alertReporting })
      if (!isAxiosError(error)) {
        throw errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: 'Get or create user error',
          error,
        })
      }

      // The Authorization header is the end user's bearer token, so 401/403
      // from city-account mean the user's token is bad. Surface them as-is
      // instead of letting fromAxiosError's default treat them as our own
      // credentials failing (BAD_GATEWAY_AUTH_ERROR, which alerts).
      throw errorFactoryService.fromAxiosError(error, {
        statusOverrides: {
          [HttpStatus.UNAUTHORIZED]: {
            status: HttpStatus.UNAUTHORIZED,
            errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
            message: 'The provided authorization token is invalid or expired.',
          },
          [HttpStatus.FORBIDDEN]: {
            status: HttpStatus.FORBIDDEN,
            errorEnum: ErrorEnum.FORBIDDEN_ERROR,
            message:
              'The provided authorization token is not allowed to get or create this user.',
          },
          [HttpStatus.NOT_FOUND]: {
            status: HttpStatus.NOT_FOUND,
            errorEnum: ErrorEnum.NOT_FOUND_ERROR,
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
