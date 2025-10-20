import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { RequestWithPartner } from './partner-auth.guard'

/**
 * Guard to validate redirect_uri against partner's allowed URIs
 * Must be used AFTER PartnerClientIdGuard or PartnerAuthGuard
 * (requires partner to already be attached to request)
 */
@Injectable()
export class RedirectUriValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithPartner>()

    // Partner must be already validated by PartnerClientIdGuard or PartnerAuthGuard
    if (!request.partner) {
      throw new BadRequestException('Partner validation must occur before redirect URI validation')
    }

    // Extract redirect_uri from query params or body
    const redirectUri = request.query?.redirect_uri || request.body?.redirect_uri

    // If no redirect_uri, let it pass (controller/service will handle if it's required)
    if (!redirectUri || typeof redirectUri !== 'string') {
      return true
    }

    // Validate redirect_uri is in partner's allowed list
    if (!request.partner.allowedRedirectUris.includes(redirectUri)) {
      throw new BadRequestException(
        `Redirect URI '${redirectUri}' is not allowed for this client`
      )
    }

    return true
  }
}
