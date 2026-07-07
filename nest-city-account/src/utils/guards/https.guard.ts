import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'

import BaConfigService from '../../config/ba-config.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum } from './dtos/error.dto'

@Injectable()
export class HttpsGuard implements CanActivate {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly baConfigService: BaConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Defaults to true (fail-safe) when REQUIRE_HTTPS is not set.
    const requireHttps = this.baConfigService.security.requireHttps ?? true
    if (!requireHttps) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()

    // TODO check this on dev cluster - we don't know what the cluster provides.
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
