import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import express from 'express'

import ClientsService from '../../clients/clients.service'
import { addSlashToBirthNumber } from '../../utils/functions/birthNumber'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'

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
      throw thrower.NotFoundException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `Get or create user error: ${String(error)}`,
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

export const BratislavaUser = (): ParameterDecorator =>
  GetUserToken(undefined, UserInfoPipe)
