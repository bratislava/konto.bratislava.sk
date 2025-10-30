import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import { AuthorizationRequestDto } from '../dtos/requests.oauth2.dto'
import { OAuth2Service } from '../oauth2.service'
import { OAuth2ValidationSubservice, AuthorizationParams } from '../subservices/oauth2-validation.subservice'

export interface RequestWithAuthorizationPayload extends Request {
  authorizationPayload?: AuthorizationRequestDto
}

/**
 * Guard for OAuth2 endpoints that use authorization request payload
 * Validates authorization request ID (payload) and loads authorization request parameters from database
 * Uses the same validation logic as AuthorizationRequestGuard via OAuth2ValidationSubservice
 * 
 * Used for: /oauth2/store, /oauth2/continue
 * 
 * The payload is an authorization request ID that references stored authorization request parameters in the database.
 * This prevents tampering since parameters are not included in the request.
 */
@Injectable()
export class AuthorizationPayloadGuard implements CanActivate {
  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly validationSubservice: OAuth2ValidationSubservice,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuthorizationPayload>()
    
    // Support both POST (body.payload) and GET (query.payload)
    const authRequestId = request.body?.payload || request.query?.payload
    if (!authRequestId || typeof authRequestId !== 'string') {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Invalid request: payload is required'
      )
    }

    // Load authorization request from database using UUID
    const authorizationRequest = await this.oauth2Service.loadAuthorizationRequest(authRequestId)
    
    if (!authorizationRequest) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Invalid payload: authorization request not found or expired'
      )
    }

    // Validate loaded authorization request parameters using shared validation subservice
    // This ensures the stored parameters are still valid
    const params: AuthorizationParams = {
      client_id: authorizationRequest.client_id,
      redirect_uri: authorizationRequest.redirect_uri,
      scope: authorizationRequest.scope,
      code_challenge: authorizationRequest.code_challenge,
      code_challenge_method: authorizationRequest.code_challenge_method,
    }

    // Validate using shared validation subservice (same logic as AuthorizationRequestGuard)
    this.validationSubservice.validateAuthorizationRequest(params, 'Invalid payload')

    // Attach validated authorization request to request for controller/service
    request.authorizationPayload = authorizationRequest

    return true
  }
}

