import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { TIERS_KEY } from '../../utils/decorators/tier.decorator'
import { CognitoTiersEnum } from '../../utils/global-dtos/cognito.dto'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CognitoSubservice } from '../../utils/subservices/cognito.subservice'

@Injectable()
export class TiersGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cognitoSubservice: CognitoSubservice,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<CognitoTiersEnum[]>(
      TIERS_KEY,
      [context.getHandler(), context.getClass()],
    )
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }
    const { cognito_user }: { cognito_user?: { _username?: string } } = context
      .switchToHttp()
      .getRequest()

    if (!cognito_user?._username) {
      throw this.throwerErrorGuard.ForbiddenException(
        ErrorsEnum.FORBIDDEN_ERROR,
        'Missing cognito user',
      )
    }

    const tier = await this.cognitoSubservice.getDataFromCognito(
      cognito_user._username,
    )
    const result = requiredRoles.some((role) => [tier].includes(role))
    if (!result) {
      throw this.throwerErrorGuard.ForbiddenException(
        ErrorsEnum.FORBIDDEN_ERROR,
        'Forbidden tier',
      )
    }
    return result
  }
}
