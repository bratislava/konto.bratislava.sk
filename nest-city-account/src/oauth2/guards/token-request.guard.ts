import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { OAuth2ValidationSubservice } from '../subservices/oauth2-validation.subservice'

/**
 * Guard for OAuth2 Token Endpoint
 * Validates token request with client authentication requirements based on grant type
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
