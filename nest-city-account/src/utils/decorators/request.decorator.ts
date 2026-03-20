import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const User = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>()
  return request.user
})
