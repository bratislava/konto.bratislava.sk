import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { Request } from 'express'
import { findPartnerByClientId, PartnerConfig } from '../config/partner.config'

export interface RequestWithPartner extends Request {
  partner?: PartnerConfig
  clientId?: string
  clientSecret?: string
}

/**
 * Guard for endpoints that require BOTH client_id AND client_secret
 * Also validates redirect_uri if present
 * Used for: /oauth/token, /oauth/revoke
 */
@Injectable()
export class PartnerAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithPartner>()

    // Extract client credentials from Authorization header (Basic Auth) or request body
    const { clientId, clientSecret } = this.extractClientCredentials(request)

    if (!clientId) {
      throw new UnauthorizedException('Client ID is required')
    }

    if (!clientSecret) {
      throw new UnauthorizedException('Client secret is required')
    }

    // Find partner configuration
    const partner = findPartnerByClientId(clientId)

    if (!partner) {
      throw new UnauthorizedException('Invalid client credentials')
    }

    // Validate client secret
    if (partner.clientSecret !== clientSecret) {
      throw new UnauthorizedException('Invalid client credentials')
    }

    // Validate redirect_uri if present
    const redirectUri = request.body?.redirect_uri || request.query?.redirect_uri
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
    request.clientSecret = clientSecret

    return true
  }

  private extractClientCredentials(request: RequestWithPartner): {
    clientId?: string
    clientSecret?: string
  } {
    let clientId: string | undefined
    let clientSecret: string | undefined

    // Try to extract from Authorization header (HTTP Basic Auth)
    const authHeader = request.headers.authorization
    if (authHeader?.startsWith('Basic ')) {
      try {
        const base64Credentials = authHeader.substring('Basic '.length)
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
        const [id, secret] = credentials.split(':')
        clientId = id
        clientSecret = secret
      } catch (error) {
        // Invalid Basic Auth header, will try body params
      }
    }

    // Try to extract from request body or query params
    if (!clientId) {
      clientId = request.body?.client_id || request.query?.client_id
      clientSecret = request.body?.client_secret || request.query?.client_secret
    }

    return { clientId, clientSecret }
  }
}
