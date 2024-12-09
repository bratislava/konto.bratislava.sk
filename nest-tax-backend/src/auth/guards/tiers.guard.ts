import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { TIERS_KEY } from 'src/utils/decorators/tier.decorator'
import { CognitoTiersEnum } from 'src/utils/global-dtos/cognito.dto'

import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CognitoSubservice } from '../../utils/subservices/cognito.subservice'

@Injectable()
export class TiersGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cognitoSubservice: CognitoSubservice,
    private throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<CognitoTiersEnum[]>(
      TIERS_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (!requiredRoles) {
      return true
    }
    const { cognito_user } = context.switchToHttp().getRequest()

    const tier = await this.cognitoSubservice.getDataFromCognito(
      cognito_user._username,
    )
    const result = requiredRoles.some((role) => [tier]?.includes(role))
    if (!result) {
      throw this.throwerErrorGuard.ForbiddenException(
        ErrorsEnum.FORBIDDEN_ERROR,
        'Forbidden tier',
      )
    }
    return result
  }
}
