import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { timingSafeEqual } from 'node:crypto'
import {
  findClientById,
  isRedirectUriAllowed,
  areScopesAllowed,
  ClientConfig,
} from '../config/client.config'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'

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
  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {}

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
    errorPrefix: string = 'Invalid request'
  ): AuthorizationValidationResult {
    // Extract and validate client_id
    const clientId = params.client_id as string | undefined
    if (!clientId || typeof clientId !== 'string' || !clientId.trim()) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `${errorPrefix}: client_id is required`
      )
    }

    // Find and validate client exists
    const client = findClientById(clientId.trim())
    if (!client) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `${errorPrefix}: Invalid client_id`
      )
    }

    // Extract and validate redirect_uri
    const redirectUri = params.redirect_uri as string | undefined
    if (!redirectUri || typeof redirectUri !== 'string' || !redirectUri.trim()) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `${errorPrefix}: redirect_uri is required`
      )
    }

    if (!isRedirectUriAllowed(client, redirectUri.trim())) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `${errorPrefix}: Redirect URI is not allowed for this client`
      )
    }

    // Validate scope if provided
    const scope = params.scope as string | undefined
    if (scope && typeof scope === 'string' && !areScopesAllowed(client, scope)) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `${errorPrefix}: Invalid scope requested`
      )
    }

    // Extract PKCE parameters
    const codeChallenge = params.code_challenge as string | undefined
    const codeChallengeMethod = params.code_challenge_method as string | undefined

    // Business logic validation: PKCE
    // If code_challenge or code_challenge_method is provided, both must be provided
    if (codeChallenge || codeChallengeMethod) {
      if (!codeChallenge || !codeChallengeMethod) {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          `${errorPrefix}: Both code_challenge and code_challenge_method must be provided when using PKCE`
        )
      }
    }

    // Business logic: Check if PKCE is required by client config
    if (client.requiresPkce) {
      if (!codeChallenge || !codeChallengeMethod) {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          `${errorPrefix}: PKCE is required for this client: code_challenge and code_challenge_method are required`
        )
      }
    }

    return {
      client,
      clientId: clientId.trim(),
      redirectUri: redirectUri.trim(),
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
  isValidClientSecret(expected: string, provided: string): boolean {
    try {
      // Convert strings to buffers for timing-safe comparison
      const expectedBuffer = Buffer.from(expected, 'utf-8')
      const providedBuffer = Buffer.from(provided, 'utf-8')
      const dummyBuffer = Buffer.alloc(expectedBuffer.length)
      const comparebuffer = expectedBuffer.length === providedBuffer.length ? providedBuffer : dummyBuffer

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
   * For refresh_token: Client authentication is optional (RFC 6749 Section 6)
   * 
   * @param params - Client authentication parameters and request context
   */
  validateTokenEndpointClientAuth(
    params: ClientAuthParams
  ): void {
    const { clientId, clientSecret, grantType } = params

    // For authorization_code grant, client authentication is REQUIRED
    if (grantType === 'authorization_code') {
      this.validateClientAuthentication(params)
      return
    }

    // For refresh_token grant, client authentication is OPTIONAL
    if (grantType === 'refresh_token') {
      if (clientId && clientSecret) {
        // Both credentials provided - validate full authentication
        this.validateClientAuthentication({
          ...params,
          redirectUri: undefined, // Not applicable for refresh_token
          codeVerifier: undefined, // Not applicable for refresh_token
        })
        return
      } else if (clientId) {
        // Only client_id provided - validate that client exists
        const client = findClientById(clientId.trim())
        if (!client) {
          throw this.throwerErrorGuard.UnauthorizedException(
            ErrorsEnum.UNAUTHORIZED_ERROR,
            'Invalid client credentials'
          )
        }
        return
      }
      // No credentials provided - validation passes, client will be identified from refresh token
      return
    }

    // Unknown grant type - if client_id provided, validate it exists
    if (clientId) {
      const client = findClientById(clientId.trim())
      if (!client) {
        throw this.throwerErrorGuard.UnauthorizedException(
          ErrorsEnum.UNAUTHORIZED_ERROR,
          'Invalid client credentials'
        )
      }
      return
    }
  }

  /**
   * Validate client authentication
   * Requires client_id (always required)
   * Validates client_secret only if client has one configured
   * Used for authorization_code grant or when authentication is required
   */
  private validateClientAuthentication(
    params: ClientAuthParams
  ): void {
    const { clientId, clientSecret } = params

    if (!clientId) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        'Invalid client credentials'
      )
    }

    const client = findClientById(clientId.trim())
    if (!client) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        'Invalid client credentials'
      )
    }

    // Only validate client_secret if client has one configured
    if (client.clientSecret) {
      if (!clientSecret) {
        throw this.throwerErrorGuard.UnauthorizedException(
          ErrorsEnum.UNAUTHORIZED_ERROR,
          'Invalid client credentials'
        )
      }
      if (!this.isValidClientSecret(client.clientSecret, clientSecret)) {
        throw this.throwerErrorGuard.UnauthorizedException(
          ErrorsEnum.UNAUTHORIZED_ERROR,
          'Invalid client credentials'
        )
      }
    }

    // Validate redirect_uri if present
    if (params.redirectUri && typeof params.redirectUri === 'string') {
      const trimmedUri = params.redirectUri.trim()
      if (!isRedirectUriAllowed(client, trimmedUri)) {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          'Redirect URI is not allowed for this client'
        )
      }
    }

    // Business logic validation: PKCE code_verifier (for authorization_code grant)
    if (params.grantType === 'authorization_code' && client.requiresPkce) {
      if (!params.codeVerifier || typeof params.codeVerifier !== 'string' || !params.codeVerifier.trim()) {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          'PKCE is required for this client: code_verifier is required'
        )
      }
    }
  }
}

