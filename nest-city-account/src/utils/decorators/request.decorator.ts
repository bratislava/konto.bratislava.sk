import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { CognitoGetUserData } from '../global-dtos/cognito.dto'

export const User = createParamDecorator(
  (data: keyof CognitoGetUserData | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<{ user: CognitoGetUserData }>()
    const user = request.user
    return data ? user?.[data] : user
  }
)
