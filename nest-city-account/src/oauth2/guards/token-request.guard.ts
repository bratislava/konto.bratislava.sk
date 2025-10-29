import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { OAuth2ValidationSubservice } from '../subservices/oauth2-validation.subservice'

/**
 * Guard for OAuth2 Token Endpoint
 * Validates token request with client authentication requirements based on grant type
 * 
 * For authorization_code grant: Requires client_id AND client_secret (both required)
 * For refresh_token grant: Client authentication is optional (RFC 6749 Section 6)
 *  - Public clients (no secret) may omit client credentials
 *  - Confidential clients may provide credentials for additional security
 * 
 * Used for: /oauth2/token
 */
@Injectable()
export class TokenRequestGuard implements CanActivate {
  constructor(private readonly validationSubservice: OAuth2ValidationSubservice) {}
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()

    // Extract client credentials from request
    const { clientId, clientSecret } = this.validationSubservice.extractClientCredentials(request)

    // Validate client authentication based on grant type
    // All validation is done here - client_id, client_secret, redirect_uri, PKCE are all checked
    // Service layer can access client_id from request body if needed
    this.validationSubservice.validateTokenEndpointClientAuth({
      clientId,
      clientSecret,
      redirectUri: request.body?.redirect_uri || request.query?.redirect_uri,
      grantType: request.body?.grant_type,
      codeVerifier: request.body?.code_verifier,
    })

    return true
  }
}

