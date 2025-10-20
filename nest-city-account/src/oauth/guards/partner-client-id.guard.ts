import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { findPartnerByClientId, PartnerConfig } from '../config/partner.config'

export interface RequestWithPartner extends Request {
  partner?: PartnerConfig
  clientId?: string
  clientSecret?: string
}

/**
 * Guard for endpoints that only need client_id validation (no secret required)
 * Used for: /oauth/authorize
 */
@Injectable()
export class PartnerClientIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithPartner>()

    // Extract client_id from query params or body
    const clientId = request.query?.client_id || request.body?.client_id

    if (!clientId || typeof clientId !== 'string') {
      throw new UnauthorizedException('Client ID is required')
    }

    // Find partner configuration
    const partner = findPartnerByClientId(clientId)

    if (!partner) {
      throw new UnauthorizedException('Invalid client ID')
    }

    // Attach partner config to request for use in controllers/services
    request.partner = partner
    request.clientId = clientId

    return true
  }
}
