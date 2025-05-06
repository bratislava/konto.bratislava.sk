import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { User } from '../types/user'

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    if (!request.user) {
      throw new Error('User not found in request')
    }

    return request.user as User
  },
)
