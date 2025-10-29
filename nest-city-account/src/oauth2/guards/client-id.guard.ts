import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { ClientConfig } from '../config/client.config'
import { OAuth2ValidationSubservice, AuthorizationParams } from '../subservices/oauth2-validation.subservice'

export interface RequestWithClientId extends Request {
  client?: ClientConfig
  clientId?: string
}

/**
 * Guard for OAuth2 Authorization Endpoint
 * Validates client_id, redirect_uri, scope, and PKCE requirements
 * Does NOT require client_secret (public clients)
 * 
 * Used for: /oauth2/authorize
 * 
 * Per RFC 7636: Authorization servers SHOULD require PKCE for public clients
 * and for authorization code grant requests
 */
@Injectable()
export class ClientIdGuard implements CanActivate {
  constructor(private readonly validationSubservice: OAuth2ValidationSubservice) {}
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithClientId>()
    const query = request.query

    // Extract parameters from query string
    const params: AuthorizationParams = {
      client_id: query?.client_id,
      redirect_uri: query?.redirect_uri,
      scope: query?.scope,
      code_challenge: query?.code_challenge,
      code_challenge_method: query?.code_challenge_method,
    }

    // Validate using shared validation subservice
    const validationResult = this.validationSubservice.validateAuthorizationRequest(
      params,
      'Invalid request'
    )

    // Attach client info to request for use in controller/service
    request.client = validationResult.client
    request.clientId = validationResult.clientId

    return true
  }
}

