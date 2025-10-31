import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import {
  OAuth2ValidationSubservice,
  AuthorizationParams,
} from '../subservices/oauth2-validation.subservice'

/**
 * Guard for OAuth2 Authorization Endpoint
 * Validates authorization request parameters (client_id, redirect_uri, scope, PKCE)
 * Does NOT require client_secret (public clients)
 *
 * Used for: /oauth2/authorize
 *
 * Per RFC 7636: Authorization servers SHOULD require PKCE for public clients
 * and for authorization code grant requests
 */
@Injectable()
export class AuthorizationRequestGuard implements CanActivate {
  constructor(private readonly validationSubservice: OAuth2ValidationSubservice) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const query = request.query

    // Extract parameters from query string
    const params: AuthorizationParams = {
      response_type: query?.response_type,
      client_id: query?.client_id,
      redirect_uri: query?.redirect_uri,
      scope: query?.scope,
      code_challenge: query?.code_challenge,
      code_challenge_method: query?.code_challenge_method,
    }

    // Validate using shared validation subservice
    // All validation is done here - client_id, redirect_uri, scope, PKCE are all checked
    // Service layer can access client_id from query params if needed
    this.validationSubservice.validateAuthorizationRequest(params)

    return true
  }
}
