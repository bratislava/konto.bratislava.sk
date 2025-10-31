import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { timingSafeEqual } from 'node:crypto'
import {
  areScopesAllowed,
  ClientConfig,
  findClientById,
  isRedirectUriAllowed,
} from '../config/client.config'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from '../oauth2.error.enum'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

export interface AuthorizationParams {
  responseType?: string | unknown
  clientId?: string | unknown
  redirectUri?: string | unknown
  scope?: string | unknown
  codeChallenge?: string | unknown
  codeChallengeMethod?: string | unknown
}

export interface ClientAuthParams {
  clientId?: string
  clientSecret?: string
  redirectUri?: string | unknown
  grantType?: string
  codeVerifier?: string
}

/**
 * Subservice for OAuth2 validation logic
 * Handles validation for both authorization requests and client authentication
 * Internal use only - not exported from module
 */
@Injectable()
export class OAuth2ValidationSubservice {
  private readonly logger = new LineLoggerSubservice(OAuth2ValidationSubservice.name)

  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {}

  /**
   * Validate authorization request parameters
   * Used by both /authorize and /continue endpoints
   *
   * @param params - The authorization parameters (from query or decoded payload)
   */
  validateAuthorizationRequest(params: AuthorizationParams) {
    const client = this.validateClientId(params.clientId)
    this.validateRedirectUri(params.redirectUri, client)
    this.validateScope(params.scope, client)
    const { codeChallenge, codeChallengeMethod } = this.validatePkceParameters(
      params.codeChallenge,
      params.codeChallengeMethod,
      client.clientId
    )
    this.validateResponseType(params.responseType, client, codeChallenge, codeChallengeMethod)
  }

  private validateClientId(clientId: string | unknown): ClientConfig {
    if (!clientId || typeof clientId !== 'string' || clientId.length === 0) {
      this.logger.error('Missing or invalid client_id in authorization request', {
        hasClientId: !!clientId,
        clientIdType: typeof clientId,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `Invalid request: client_id is required`
      )
    }

    const client = findClientById(clientId)
    if (!client) {
      this.logger.error('Client not found', {
        clientId: clientId,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.UNAUTHORIZED_CLIENT,
        `Unauthorized client: unknown client`
      )
    }

    return client
  }

  private validateRedirectUri(redirectUri: string | unknown, client: ClientConfig): string {
    if (!redirectUri || typeof redirectUri !== 'string' || redirectUri.length === 0) {
      this.logger.error('Missing or invalid redirect_uri in authorization request', {
        clientId: client.clientId,
        hasRedirectUri: !!redirectUri,
        redirectUriType: typeof redirectUri,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `Invalid request: redirect_uri is required`
      )
    }

    if (!isRedirectUriAllowed(client, redirectUri)) {
      this.logger.error('Redirect URI not allowed for client', {
        clientId: client.clientId,
        redirectUri: redirectUri,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `Invalid request: provided redirect URI is not allowed for this client`
      )
    }

    return redirectUri
  }

  private validateScope(scope: string | unknown, client: ClientConfig): string | undefined {
    if (scope === undefined) {
      return undefined
    }
    if (typeof scope !== 'string' || !areScopesAllowed(client, scope as string)) {
      this.logger.error('Invalid scope requested', {
        clientId: client.clientId,
        requestedScope: scope,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.INVALID_SCOPE,
        `Invalid scope: requested scope is invalid, unknown, or malformed`
      )
    }
    return scope
  }

  private validatePkceParameters(
    codeChallenge: string | unknown,
    codeChallengeMethod: string | unknown,
    clientId: string
  ): { codeChallenge?: string; codeChallengeMethod?: string } {
    if (codeChallenge === undefined && codeChallengeMethod === undefined) {
      return { codeChallenge: undefined, codeChallengeMethod: undefined }
    }

    if (
      typeof codeChallenge !== 'string' ||
      codeChallenge.length === 0 ||
      typeof codeChallengeMethod !== 'string' ||
      codeChallengeMethod.length === 0
    ) {
      this.logger.error('PKCE parameters incomplete', {
        clientId: clientId,
        hasCodeChallenge: !!codeChallenge,
        hasCodeChallengeMethod: !!codeChallengeMethod,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `Invalid request: both code_challenge and code_challenge_method must be provided when using PKCE`
      )
    }

    return { codeChallenge, codeChallengeMethod }
  }

  private validateResponseType(
    responseType: string | unknown,
    client: ClientConfig,
    codeChallenge?: string,
    codeChallengeMethod?: string
  ): string {
    if (!responseType || typeof responseType !== 'string') {
      this.logger.error('Missing or invalid response_type in authorization request', {
        clientId: client.clientId,
        hasResponseType: !!responseType,
        responseTypeValue: responseType,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `Invalid request: response_type is required`
      )
    }

    if (!['code', 'token'].includes(responseType)) {
      this.logger.error('Unsupported response_type', {
        clientId: client.clientId,
        responseType: responseType,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.UNSUPPORTED_RESPONSE_TYPE,
        `Unsupported response_type: ${responseType} - must be "code" or "token"`
      )
    }

    if (client.requiresPkce) {
      if (!codeChallenge || !codeChallengeMethod) {
        this.logger.error('PKCE required but not provided', {
          clientId: client.clientId,
          hasCodeChallenge: !!codeChallenge,
          hasCodeChallengeMethod: !!codeChallengeMethod,
        })
        throw this.throwerErrorGuard.OAuth2AuthorizationException(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          `Invalid request: PKCE is required for this client: code_challenge and code_challenge_method are required`
        )
      }

      if (responseType !== 'code') {
        throw this.throwerErrorGuard.OAuth2AuthorizationException(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          `Invalid request: response_type must be "code" when PKCE is required for this client`
        )
      }
    }

    if (responseType === 'token') {
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.UNSUPPORTED_RESPONSE_TYPE,
        `Unsupported response_type: "token" response_type is not supported - use "code" with PKCE instead`
      )
    }

    return responseType
  }

  /**
   * Extract client credentials from request (Basic Auth header or body)
   */
  extractClientCredentials(request: Request): {
    clientId?: string
    clientSecret?: string
  } {
    let clientId: string | undefined
    let clientSecret: string | undefined

    // Try to extract from Authorization header (HTTP Basic Auth)
    const authHeader = request.headers.authorization
    if (authHeader?.startsWith('Basic ')) {
      try {
        const base64Credentials = authHeader.substring('Basic '.length).trim()
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')

        const colonIndex = credentials.indexOf(':')
        if (colonIndex > 0) {
          clientId = credentials.substring(0, colonIndex)
          clientSecret = credentials.substring(colonIndex + 1)
        }
      } catch (error) {
        // Invalid base64 or malformed credentials
      }
    }

    if (!clientId) {
      const bodyClientId = request.body?.client_id
      const bodyClientSecret = request.body?.client_secret

      // Validate that values are non-empty strings (do not trim client-provided values)
      if (typeof bodyClientId === 'string' && bodyClientId.length > 0) {
        clientId = bodyClientId
      }
      if (typeof bodyClientSecret === 'string' && bodyClientSecret.length > 0) {
        clientSecret = bodyClientSecret
      }
    }

    return { clientId, clientSecret }
  }

  /**
   * Timing-safe comparison of client secrets to prevent timing attacks
   */
  isValidSecret(expected: string, provided: string): boolean {
    try {
      // Convert strings to buffers for timing-safe comparison
      const expectedBuffer = Buffer.from(expected, 'utf-8')
      const providedBuffer = Buffer.from(provided, 'utf-8')
      const dummyBuffer = Buffer.alloc(expectedBuffer.length)
      const comparebuffer =
        expectedBuffer.length === providedBuffer.length ? providedBuffer : dummyBuffer

      return timingSafeEqual(expectedBuffer, comparebuffer)
    } catch (error) {
      // timingSafeEqual throws if buffers have different lengths
      return false
    }
  }

  /**
   * Validate client authentication for token endpoint
   * Handles different grant types with appropriate authentication requirements
   *
   * For authorization_code: Requires client_id (client_secret optional if client doesn't have one configured)
   * For refresh_token: client_id optional (should be resolved from JWT before calling this); if client has a configured secret, both client_id and client_secret MUST be provided and valid
   *
   * @param params - Client authentication parameters and request context
   */
  validateTokenRequest(params: ClientAuthParams): void {
    if (params.grantType === 'authorization_code') {
      this.validateClientAuthentication(params)
      return
    }

    if (params.grantType === 'refresh_token') {
      this.validateClientAuthentication({
        ...params,
        redirectUri: undefined, // Not applicable for refresh_token
        codeVerifier: undefined, // Not applicable for refresh_token
      })
      return
    }

    this.logger.error('Unsupported grant type', {
      grantType: params.grantType,
    })
    throw this.throwerErrorGuard.OAuth2TokenException(
      OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE,
      `Unsupported grant type: ${params.grantType}`
    )
  }

  /**
   * Validate client authentication
   * Requires client_id (always required)
   * Validates client_secret only if client has one configured
   * Used for authorization_code grant or when authentication is required
   */
  private validateClientAuthentication(params: ClientAuthParams): void {
    const { clientId, clientSecret, grantType } = params

    if (!clientId) {
      this.logger.error('Missing client_id in token request', {
        grantType,
        hasClientSecret: !!clientSecret,
      })
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_CLIENT,
        'Invalid request: client_id is required'
      )
    }

    const client = findClientById(clientId)
    if (!client) {
      this.logger.error('Client not found for token request', {
        clientId: clientId,
        grantType,
      })
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_CLIENT,
        `Unauthorized client: unknown client`
      )
    }

    // Only validate client_secret if client has one configured
    if (client.clientSecret) {
      if (!clientSecret) {
        this.logger.error('Client secret required but not provided', {
          clientId: clientId,
          grantType,
        })
        throw this.throwerErrorGuard.OAuth2TokenException(
          OAuth2TokenErrorCode.INVALID_CLIENT,
          'Invalid client: client_secret is required'
        )
      }
      if (!this.isValidSecret(client.clientSecret, clientSecret)) {
        this.logger.error('Invalid client secret provided', {
          clientId: clientId,
          grantType,
          hasClientSecret: !!clientSecret,
        })
        throw this.throwerErrorGuard.OAuth2TokenException(
          OAuth2TokenErrorCode.INVALID_CLIENT,
          'Invalid client: invalid client_secret'
        )
      }
    }

    // Validate redirect_uri if present
    if (params.redirectUri && typeof params.redirectUri === 'string') {
      if (!isRedirectUriAllowed(client, params.redirectUri)) {
        this.logger.error('Redirect URI not allowed for client in token request', {
          clientId: clientId,
          redirectUri: params.redirectUri,
          grantType,
        })
        throw this.throwerErrorGuard.OAuth2TokenException(
          OAuth2TokenErrorCode.INVALID_REQUEST,
          `Invalid request: provided redirect URI is not allowed for this client`
        )
      }
    }

    // Business logic validation: PKCE code_verifier (for authorization_code grant)
    if (params.grantType === 'authorization_code' && client.requiresPkce) {
      if (
        !params.codeVerifier ||
        typeof params.codeVerifier !== 'string' ||
        params.codeVerifier.length === 0
      ) {
        this.logger.error('PKCE code_verifier required but not provided', {
          clientId: clientId,
          grantType: params.grantType,
          hasCodeVerifier: !!params.codeVerifier,
        })
        throw this.throwerErrorGuard.OAuth2TokenException(
          OAuth2TokenErrorCode.INVALID_REQUEST,
          'Invalid request: PKCE code_verifier is required'
        )
      }
    }
  }
}
