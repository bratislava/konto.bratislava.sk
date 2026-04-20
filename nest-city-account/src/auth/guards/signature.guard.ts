import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

import { ErrorsEnum, ErrorsResponseEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { REQUIRE_NONCE } from '../decorators/require-nonce.decorator'
import { SIGNATURE_PUBLIC_KEY } from '../decorators/signature-public-key.decorator'
import { SignatureRequest } from '../types/signature-request.types'

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
    const request = context.switchToHttp().getRequest<SignatureRequest>()

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

    const requireNonce = this.reflector.getAllAndOverride<boolean | undefined>(REQUIRE_NONCE, [
      context.getHandler(),
      context.getClass(),
    ])

    request.signaturePublicKeyEnvVar = envVarName
    request.requireNonce = !!requireNonce

    return !!(await super.canActivate(context))
  }
}
