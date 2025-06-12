import {
  BadRequestException,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { User } from '../../auth-v2/types/user'
import {
  FormAccessOptions,
  FormAccessService,
  FormAccessType,
} from '../services/form-access.service'

const FORM_ACCESS_TYPE_KEY = 'formAccessType'

interface RequestWithUser extends Request {
  user: User
}

interface RequestWithFormAccess extends RequestWithUser {
  [FORM_ACCESS_TYPE_KEY]: FormAccessType
}

const FORM_ACCESS_ALLOW_MIGRATIONS_KEY = 'formAccessAllowMigrations'

export const FormAccessAllowMigrations = () =>
  SetMetadata(FORM_ACCESS_ALLOW_MIGRATIONS_KEY, true)

export const GetFormAccessType = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithFormAccess>()

    if (!request[FORM_ACCESS_TYPE_KEY]) {
      throw new InternalServerErrorException(
        'Form access type not found. Make sure to use FormAccessGuard before accessing this parameter.',
      )
    }

    return request[FORM_ACCESS_TYPE_KEY]
  },
)

@Injectable()
export class FormAccessGuard implements CanActivate {
  constructor(
    private readonly formAccessService: FormAccessService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const { formId } = request.params

    if (!formId || typeof formId !== 'string') {
      throw new BadRequestException('formId path parameter is required')
    }

    const { user } = request
    if (!user) {
      throw new BadRequestException('User not found')
    }

    const checkMigrations =
      this.reflector.getAllAndOverride<boolean | undefined>(
        FORM_ACCESS_ALLOW_MIGRATIONS_KEY,
        [context.getHandler(), context.getClass()],
      ) === true

    const options: FormAccessOptions = {
      checkMigrations,
    }

    const accessType = await this.formAccessService.hasAccess(
      formId,
      user,
      options,
    )

    if (accessType) {
      ;(request as RequestWithFormAccess)[FORM_ACCESS_TYPE_KEY] = accessType
      return true
    }

    return false
  }
}
