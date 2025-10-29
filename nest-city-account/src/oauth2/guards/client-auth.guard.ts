import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { ClientConfig } from '../config/client.config'
import { OAuth2ValidationSubservice } from '../subservices/oauth2-validation.subservice'

export interface RequestWithClient extends Request {
  client?: ClientConfig
  clientId?: string
}

/**
 * Guard for endpoints that require BOTH client_id AND client_secret
 * Also validates redirect_uri if present
 * Used for: /oauth2/token
 */
@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(private readonly validationSubservice: OAuth2ValidationSubservice) {}
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithClient>()

    // Extract client credentials from request
    const { clientId, clientSecret } = this.validationSubservice.extractClientCredentials(request)

    // Validate client authentication
    const validationResult = this.validationSubservice.validateClientAuthentication({
      clientId,
      clientSecret,
      redirectUri: request.body?.redirect_uri || request.query?.redirect_uri,
      grantType: request.body?.grant_type,
      codeVerifier: request.body?.code_verifier,
    })

    // Attach client info to request
    request.client = validationResult.client
    request.clientId = validationResult.clientId

    return true
  }
}

