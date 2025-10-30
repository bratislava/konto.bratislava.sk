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
  client_id?: string | unknown
  redirect_uri?: string | unknown
  scope?: string | unknown
  code_challenge?: string | unknown
  code_challenge_method?: string | unknown
}

export interface AuthorizationValidationResult {
  client: ClientConfig
  clientId: string
  redirectUri: string
  scope?: string
  codeChallenge?: string
  codeChallengeMethod?: string
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

  private static readonly INVALID_CLIENT_MSG = 'Invalid client credentials'

  /**
   * Validate authorization request parameters
   * Used by both /authorize and /continue endpoints
   *
   * @param params - The authorization parameters (from query or decoded payload)
   * @param errorPrefix - Prefix for error messages (e.g., "Invalid request" or "Invalid payload")
   * @returns Validated authorization parameters and client config
   */
  validateAuthorizationRequest(
    params: AuthorizationParams,
    errorPrefix: string = 'Invalid request' // TODO This seems weird,
  ): AuthorizationValidationResult {
    // Extract and validate client_id
    const clientId = params.client_id as string | undefined
    if (!clientId || typeof clientId !== 'string' || !clientId.trim()) {
      this.logger.error('Missing or invalid client_id in authorization request', {
        hasClientId: !!clientId,
        clientIdType: typeof clientId,
        errorPrefix,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `${errorPrefix}: client_id is required` // TODO description
      )
    }

    // Find and validate client exists
    const trimmedClientId = clientId.trim()
    const client = findClientById(trimmedClientId)
    if (!client) {
      this.logger.error('Client not found', {
        clientId: trimmedClientId,
        errorPrefix,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.UNAUTHORIZED_CLIENT,
        `${errorPrefix}: Invalid client_id` // TODO description
      )
    }

    // Extract and validate redirect_uri
    const redirectUri = params.redirect_uri as string | undefined
    if (!redirectUri || typeof redirectUri !== 'string' || !redirectUri.trim()) {
      this.logger.error('Missing or invalid redirect_uri in authorization request', {
        clientId: trimmedClientId,
        hasRedirectUri: !!redirectUri,
        redirectUriType: typeof redirectUri,
        errorPrefix,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `${errorPrefix}: redirect_uri is required` // TODO description
      )
    }

    const trimmedRedirectUri = redirectUri.trim()
    if (!isRedirectUriAllowed(client, trimmedRedirectUri)) {
      this.logger.error('Redirect URI not allowed for client', {
        clientId: trimmedClientId,
        redirectUri: trimmedRedirectUri,
        errorPrefix,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.UNAUTHORIZED_CLIENT,
        `${errorPrefix}: Redirect URI is not allowed for this client` // TODO description
      )
    }

    // Validate scope if provided
    const scope = params.scope as string | undefined
    if (scope && typeof scope === 'string' && !areScopesAllowed(client, scope)) {
      // TODO type of scope is always string
      this.logger.error('Invalid scope requested', {
        clientId: trimmedClientId,
        requestedScope: scope,
        errorPrefix,
      })
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
        OAuth2AuthorizationErrorCode.INVALID_SCOPE,
        `${errorPrefix}: Invalid scope requested` // TODO description
      )
    }

    // Extract PKCE parameters
    const codeChallenge = params.code_challenge as string | undefined
    const codeChallengeMethod = params.code_challenge_method as string | undefined

    // Business logic validation: PKCE
    // If code_challenge or code_challenge_method is provided, both must be provided
    if (codeChallenge || codeChallengeMethod) {
      if (!codeChallenge || !codeChallengeMethod) {
        this.logger.error('PKCE parameters incomplete', {
          clientId: trimmedClientId,
          hasCodeChallenge: !!codeChallenge,
          hasCodeChallengeMethod: !!codeChallengeMethod,
          errorPrefix,
        })
        throw this.throwerErrorGuard.OAuth2AuthorizationException(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          `${errorPrefix}: Both code_challenge and code_challenge_method must be provided when using PKCE` // TODO description
        )
      }
    }

    // Business logic: Check if PKCE is required by client config
    if (client.requiresPkce) {
      if (!codeChallenge || !codeChallengeMethod) {
        this.logger.error('PKCE required but not provided', {
          clientId: trimmedClientId,
          hasCodeChallenge: !!codeChallenge,
          hasCodeChallengeMethod: !!codeChallengeMethod,
          errorPrefix,
        })
        throw this.throwerErrorGuard.OAuth2AuthorizationException(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          `${errorPrefix}: PKCE is required for this client: code_challenge and code_challenge_method are required` // TODO description
        )
      }
    }

    return {
      client,
      clientId: trimmedClientId,
      redirectUri: trimmedRedirectUri,
      scope: scope ? scope.trim() : undefined,
      codeChallenge: codeChallenge?.trim(),
      codeChallengeMethod: codeChallengeMethod?.trim(),
    }
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

      // Validate that values are non-empty strings
      if (typeof bodyClientId === 'string' && bodyClientId.trim()) {
        clientId = bodyClientId.trim()
      }
      if (typeof bodyClientSecret === 'string' && bodyClientSecret.trim()) {
        clientSecret = bodyClientSecret.trim()
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
  validateTokenEndpointClientAuth(params: ClientAuthParams): void {
    if (params.grantType === 'refresh_token') {
      this.validateClientAuthentication({
        ...params,
        redirectUri: undefined, // Not applicable for refresh_token
        codeVerifier: undefined, // Not applicable for refresh_token
      })
      return
    }

    this.validateClientAuthentication(params)
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
        OAuth2ValidationSubservice.INVALID_CLIENT_MSG // TODO description
      )
    }

    const trimmedClientId = clientId.trim()
    const client = findClientById(trimmedClientId)
    if (!client) {
      this.logger.error('Client not found for token request', {
        clientId: trimmedClientId,
        grantType,
      })
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_CLIENT,
        OAuth2ValidationSubservice.INVALID_CLIENT_MSG // TODO description
      )
    }

    // Only validate client_secret if client has one configured
    if (client.clientSecret) {
      if (!clientSecret) {
        this.logger.error('Client secret required but not provided', {
          clientId: trimmedClientId,
          grantType,
        })
        throw this.throwerErrorGuard.OAuth2TokenException(
          OAuth2TokenErrorCode.INVALID_CLIENT,
          OAuth2ValidationSubservice.INVALID_CLIENT_MSG // TODO description
        )
      }
      if (!this.isValidSecret(client.clientSecret, clientSecret)) {
        this.logger.error('Invalid client secret provided', {
          clientId: trimmedClientId,
          grantType,
          hasClientSecret: !!clientSecret,
        })
        throw this.throwerErrorGuard.OAuth2TokenException(
          OAuth2TokenErrorCode.INVALID_CLIENT,
          OAuth2ValidationSubservice.INVALID_CLIENT_MSG // TODO description
        )
      }
    }

    // Validate redirect_uri if present
    if (params.redirectUri && typeof params.redirectUri === 'string') {
      const trimmedUri = params.redirectUri.trim()
      if (!isRedirectUriAllowed(client, trimmedUri)) {
        this.logger.error('Redirect URI not allowed for client in token request', {
          clientId: trimmedClientId,
          redirectUri: trimmedUri,
          grantType,
        })
        throw this.throwerErrorGuard.OAuth2TokenException(
          OAuth2TokenErrorCode.INVALID_REQUEST,
          'Redirect URI is not allowed for this client' // TODO description
        )
      }
    }

    // Business logic validation: PKCE code_verifier (for authorization_code grant)
    if (params.grantType === 'authorization_code' && client.requiresPkce) {
      if (
        !params.codeVerifier ||
        typeof params.codeVerifier !== 'string' ||
        !params.codeVerifier.trim()
      ) {
        this.logger.error('PKCE code_verifier required but not provided', {
          clientId: trimmedClientId,
          grantType: params.grantType,
          hasCodeVerifier: !!params.codeVerifier,
        })
        throw this.throwerErrorGuard.OAuth2TokenException(
          OAuth2TokenErrorCode.INVALID_REQUEST,
          'PKCE is required for this client: code_verifier is required' // TODO description
        )
      }
    }
  }
}
