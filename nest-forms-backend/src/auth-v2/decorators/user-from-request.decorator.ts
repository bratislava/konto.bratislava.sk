import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { User } from '../types/user' // Adjust the import path as needed

export const UserFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    if (!request.user) {
      throw new Error('User not found in request')
    }

    return request.user as User
  },
)
