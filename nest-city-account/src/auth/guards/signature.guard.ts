import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum, ErrorsResponseEnum } from '../../utils/guards/dtos/error.dto'
import { SIGNATURE_PUBLIC_KEY } from '../decorators/signature-public-key.decorator'

/**
 * Guard that validates requests signed with RSA private key using Passport strategy
 * Verifies signature using the client's public key from environment variables
 * Prevents replay attacks by checking timestamp freshness
 *
 * Usage:
 * @SignaturePublicKey('YOUR_ENV_VAR_NAME')
 * @UseGuards(SignatureGuard)
 */
@Injectable()
export class SignatureGuard extends AuthGuard('signature') {
  constructor(
    private readonly reflector: Reflector,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()

    const envVarName = this.reflector.getAllAndOverride<string>(SIGNATURE_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!envVarName) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Public key environment variable not specified. Use @SignaturePublicKey() decorator on the endpoint.'
      )
    }

    ;(request as any).signaturePublicKeyEnvVar = envVarName

    return !!(await super.canActivate(context))
  }
}
