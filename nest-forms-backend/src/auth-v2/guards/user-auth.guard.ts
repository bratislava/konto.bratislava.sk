import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

import { ALLOWED_USER_TYPES_KEY } from '../decorators/allowed-user-types.decorator'
import { User, UserType } from '../types/user'

@Injectable()
export class UserAuthGuard extends AuthGuard('user-auth') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const allowedUserTypes = this.reflector.getAllAndOverride<
      UserType[] | undefined
    >(ALLOWED_USER_TYPES_KEY, [context.getHandler(), context.getClass()])

    if (allowedUserTypes === undefined) {
      const controllerName = context.getClass().name
      const handlerName = context.getHandler().name

      throw new InternalServerErrorException(
        `UserAuthGuard is used on ${controllerName}.${handlerName} without the @AllowedUserTypes() decorator. ` +
          `Please specify the allowed user types (e.g., @AllowedUserTypes([UserType.Auth, UserType.Guest])).`,
      )
    }

    if (allowedUserTypes.length === 0) {
      const controllerName = context.getClass().name
      const handlerName = context.getHandler().name

      throw new InternalServerErrorException(
        `UserAuthGuard is used on ${controllerName}.${handlerName} with an empty @AllowedUserTypes() decorator. ` +
          `Please specify at least one allowed user type (e.g., @AllowedUserTypes([UserType.Auth])).`,
      )
    }

    return super.canActivate(context)
  }

  handleRequest<TUser = User>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ) {
    if (err) {
      throw err
    }
    if (!user) {
      throw new UnauthorizedException('No user found in request.')
    }

    const typedUser = user as User

    // At this point, canActivate has already ensured allowedUserTypes is defined.
    const allowedUserTypes = this.reflector.getAllAndOverride<UserType[]>(
      ALLOWED_USER_TYPES_KEY,
      [context.getHandler(), context.getClass()],
    )!

    if (allowedUserTypes.includes(typedUser.type)) {
      return typedUser as TUser
    }

    throw new UnauthorizedException(
      `Access denied for user type '${typedUser.type}'. Allowed types: ${allowedUserTypes.join(', ')}.`,
    )
  }
}
