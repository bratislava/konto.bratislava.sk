import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { findPartnerByClientId } from '../config/partner.config'
import { RequestWithPartner } from './partner-auth.guard'

/**
 * Guard for endpoints that only need client_id validation (no secret required)
 * Also validates redirect_uri if present
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

    // Validate redirect_uri if present
    const redirectUri = request.query?.redirect_uri || request.body?.redirect_uri
    if (redirectUri && typeof redirectUri === 'string') {
      if (!partner.allowedRedirectUris.includes(redirectUri)) {
        throw new BadRequestException(
          `Redirect URI '${redirectUri}' is not allowed for this client`
        )
      }
    }

    // Attach partner config to request for use in controllers/services
    request.partner = partner
    request.clientId = clientId

    return true
  }
}
