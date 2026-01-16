import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { AuthorizationRequestDto } from '../dtos/requests.oauth2.dto'
import { OAuth2Service } from '../oauth2.service'
import {
  AuthorizationParams,
  OAuth2ValidationSubservice,
} from '../subservices/oauth2-validation.subservice'
import { OAuth2AuthorizationErrorCode } from '../oauth2.error.enum'
import { OAuth2ErrorThrower } from '../oauth2-error.thrower'

export interface RequestWithAuthorizationData extends Request {
  authorizationRequestData?: AuthorizationRequestDto
}

/**
 * Guard for OAuth2 endpoints that use authorization request ID
 * Validates authorization request ID and loads authorization request parameters from database
 * Uses the same validation logic as AuthorizationRequestGuard via OAuth2ValidationSubservice
 *
 * Used for: /oauth2/store, /oauth2/continue
 *
 * The authRequestId references stored authorization request parameters in the database.
 * This prevents tampering since parameters are not included in the request.
 */
@Injectable()
export class AuthRequestIdGuard implements CanActivate {
  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly validationSubservice: OAuth2ValidationSubservice,
    private readonly oAuth2ErrorThrower: OAuth2ErrorThrower
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuthorizationData>()

    // Support both POST (body.authRequestId) and GET (query.authRequestId)
    const authRequestId = request.body?.authRequestId || request.query?.authRequestId
    if (!authRequestId || typeof authRequestId !== 'string') {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization server error: missing authRequestId',
        undefined,
        'Missing or invalid authRequestId parameter',
        {
          hasBodyAuthRequestId: !!request.body?.authRequestId,
          hasQueryAuthRequestId: !!request.query?.authRequestId,
          authRequestIdType: typeof authRequestId,
          method: request.method,
        }
      )
    }

    // Load authorization request from database using UUID
    let authRequestData: AuthorizationRequestDto | undefined
    try {
      authRequestData = await this.oauth2Service.loadAuthorizationRequest(authRequestId)
    } catch (error) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization server error: failed to process authorization request',
        undefined,
        'Failed to load authorization request',
        { authRequestId, error }
      )
    }

    if (!authRequestData) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization server error: authorization request not found or expired',
        undefined,
        'Authorization request not found for authRequestId',
        { authRequestId, method: request.method }
      )
    }

    const params: AuthorizationParams = {
      responseType: authRequestData?.response_type,
      clientId: authRequestData?.client_id,
      redirectUri: authRequestData?.redirect_uri,
      scope: authRequestData?.scope,
      state: authRequestData?.state,
      codeChallenge: authRequestData?.code_challenge,
      codeChallengeMethod: authRequestData?.code_challenge_method,
    }

    try {
      this.validationSubservice.validateAuthorizationRequest(params)
    } catch (error) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization server error: authorization request parameters are corrupted',
        undefined,
        'Invalid authorization request from authRequestId',
        { authRequestId, method: request.method }
      )
    }

    // Attach validated authorization request to request for controller/service
    request.authorizationRequestData = authRequestData

    return true
  }
}
