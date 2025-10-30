import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'

@Injectable()
export class HttpsGuard implements CanActivate {
  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {}

  canActivate(context: ExecutionContext): boolean {
    if (process.env.DISABLE_HTTPS === 'true') {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()

    // Check if request is secure (various common headers set by proxies/load balancers)
    const isSecure =
      request.secure ||
      request.headers['x-forwarded-proto'] === 'https' ||
      request.headers['x-forwarded-ssl'] === 'on' ||
      request.headers['x-arr-ssl'] !== undefined || // Azure
      request.headers['cloudfront-forwarded-proto'] === 'https' // CloudFront

    if (!isSecure) {
      throw this.throwerErrorGuard.ForbiddenException(
        ErrorsEnum.FORBIDDEN_ERROR,
        'HTTPS is required for OAuth2 endpoints',
        'Insecure connection attempt blocked'
      )
    }

    return true
  }
}