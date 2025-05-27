import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Transform, TransformFnParams } from 'class-transformer'

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

export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) =>
    value === undefined
      ? undefined
      : value === 'true' || value === true || value === 1 || value === '1',
  )
}
