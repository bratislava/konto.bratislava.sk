import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { AuthorizationRequestDto } from '../dtos/requests.oauth2.dto'
import { OAuth2Service } from '../oauth2.service'
import { OAuth2ValidationSubservice } from '../subservices/oauth2-validation.subservice'
import { OAuth2AuthorizationErrorCode } from '../oauth2.error.enum'
import { OAuth2ErrorThrower } from '../oauth2-error.thrower'

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
    private readonly oAuth2ErrorThrower: OAuth2ErrorThrower
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuthorizationPayload>()

    // Support both POST (body.payload) and GET (query.payload)
    const authRequestId = request.body?.payload || request.query?.payload
    if (!authRequestId || typeof authRequestId !== 'string') {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization server error: missing payload',
        undefined,
        'Missing or invalid payload parameter', {
          hasBodyPayload: !!request.body?.payload,
          hasQueryPayload: !!request.query?.payload,
          payloadType: typeof authRequestId,
          method: request.method,
        }
      )
    }

    // Load authorization request from database using UUID
    const authorizationRequest = await this.oauth2Service.loadAuthorizationRequest(authRequestId)

    if (!authorizationRequest) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization server error: authorization request not found or expired',
        undefined,
        'Authorization request not found for payload', {
          authRequestId,
          method: request.method,
        }
      )
    }

    try {
      this.validationSubservice.validateAuthorizationRequest(authorizationRequest)
    } catch (error) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization server error: authorization request parameters are corrupted',
        undefined,
        'Invalid authorization request from payload', {
          authRequestId,
          method: request.method,
        }
      )
    }

    // Attach validated authorization request to request for controller/service
    request.authorizationPayload = authorizationRequest

    return true
  }
}
