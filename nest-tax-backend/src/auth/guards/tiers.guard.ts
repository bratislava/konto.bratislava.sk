import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserVerifyStateCognitoTierEnum } from 'openapi-clients/city-account'

import { TIERS_KEY } from '../../utils/decorators/tier.decorator'
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
    const requiredRoles = this.reflector.getAllAndOverride<
      UserVerifyStateCognitoTierEnum[]
    >(TIERS_KEY, [context.getHandler(), context.getClass()])
    if (!requiredRoles) {
      return true
    }
    const { cognito_jwt_payload } = context.switchToHttp().getRequest()

    const tier = await this.cognitoSubservice.getUserTierFromCognito(
      cognito_jwt_payload.sub,
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
