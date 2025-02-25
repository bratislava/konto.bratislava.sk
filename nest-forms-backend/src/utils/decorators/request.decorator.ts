import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Transform, TransformFnParams } from 'class-transformer'
import express from 'express'

import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../../nases/nases.errors.enum'
import { cityAccountApi } from '../clients/cityAccountApi'
import ThrowerErrorGuard from '../guards/thrower-error.guard'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const { user } = request

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return data ? user?.[data] : user
  },
)
/* eslint-enable @typescript-eslint/no-unsafe-assignment */

export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<express.Request>()
    const token = request.headers.authorization

    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (token === undefined) return token

    return cityAccountApi
      .userControllerGetOrCreateUser({
        headers: {
          Authorization: token,
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        const thrower = new ThrowerErrorGuard()

        throw thrower.NotFoundException(
          NasesErrorsEnum.CITY_ACCOUNT_USER_GET_ERROR,
          `${NasesErrorsResponseEnum.CITY_ACCOUNT_USER_GET_ERROR} error: ${<
            string
          >error}`,
        )
      })
  },
)

export const BearerToken = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<express.Request>()
    return request.headers.authorization
  },
)

export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) =>
    value === undefined
      ? undefined
      : value === 'true' || value === true || value === 1 || value === '1',
  )
}
