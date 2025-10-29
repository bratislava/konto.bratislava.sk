import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import { AuthorizationRequestDto } from '../dtos/requests.oauth2.dto'
import { OAuth2ValidationSubservice, AuthorizationParams } from '../subservices/oauth2-validation.subservice'
import { ClientConfig } from '../config/client.config'

export interface RequestWithContinuePayload extends Request {
  continuePayload?: AuthorizationRequestDto
  client?: ClientConfig
  clientId?: string
}

/**
 * Guard for OAuth2 Continue Endpoint
 * Validates and decodes the payload containing original authorization request parameters
 * Uses the same validation logic as ClientIdGuard via AuthorizationValidationService
 * 
 * Used for: /oauth2/continue
 * 
 * This is an internal endpoint called by our frontend, so validation is
 * less strict than public endpoints but still ensures data integrity
 */
@Injectable()
export class ContinuePayloadGuard implements CanActivate {
  constructor(
    private readonly validationSubservice: OAuth2ValidationSubservice,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithContinuePayload>()
    const body = request.body

    const payloadString = body?.payload
    if (!payloadString || typeof payloadString !== 'string') {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Invalid request: payload is required'
      )
    }

    // Decode base64 payload
    let decodedPayload: Record<string, unknown>
    try {
      const decoded = Buffer.from(payloadString, 'base64').toString('utf-8')
      decodedPayload = JSON.parse(decoded)
    } catch (error) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Invalid payload: must be valid base64-encoded JSON'
      )
    }

    // Extract parameters from decoded payload
    const params: AuthorizationParams = {
      client_id: decodedPayload.client_id,
      redirect_uri: decodedPayload.redirect_uri,
      scope: decodedPayload.scope,
      code_challenge: decodedPayload.code_challenge,
      code_challenge_method: decodedPayload.code_challenge_method,
    }

    // Validate using shared validation subservice (same logic as ClientIdGuard)
    const validationResult = this.validationSubservice.validateAuthorizationRequest(
      params,
      'Invalid payload'
    )

    // Extract state (optional per RFC 6749 Section 4.1.1)
    const state = decodedPayload.state as string | undefined

    // Build AuthorizationRequestDto from decoded payload
    const authorizationRequest: AuthorizationRequestDto = {
      response_type: (decodedPayload.response_type as string) || 'code',
      client_id: validationResult.clientId,
      redirect_uri: validationResult.redirectUri,
      scope: validationResult.scope,
      state: state && typeof state === 'string' ? state.trim() : undefined,
      code_challenge: validationResult.codeChallenge,
      code_challenge_method: validationResult.codeChallengeMethod,
      login_hint: decodedPayload.login_hint as string | undefined,
      ui_locales: decodedPayload.ui_locales as string | undefined,
    }

    // Attach decoded payload and client info to request
    request.continuePayload = authorizationRequest
    request.client = validationResult.client
    request.clientId = validationResult.clientId

    return true
  }
}

