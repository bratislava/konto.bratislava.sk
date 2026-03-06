import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { timingSafeEqual } from 'node:crypto'
import { OAuth2Client, OAuth2ClientSubservice } from './oauth2-client.subservice'
import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from '../oauth2.error.enum'
import { OAuth2ErrorThrower } from '../oauth2-error.thrower'

export interface AuthorizationParams {
  responseType?: string | unknown
  clientId?: string | unknown
  redirectUri?: string | unknown
  scope?: string | unknown
  state?: string | unknown
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
  constructor(
    private readonly oAuth2ErrorThrower: OAuth2ErrorThrower,
    private readonly oAuth2ClientSubservice: OAuth2ClientSubservice
  ) {}

  /**
   * Validate authorization request parameters
   * Used by both /authorize and /continue endpoints
   *
   * @param params - The authorization parameters (from query or loaded from DB by authRequestId)
   */
  validateAuthorizationRequest(params: AuthorizationParams) {
    const client = this.validateClientId(params.clientId)
    this.validateRedirectUri(params.redirectUri, client)
    this.validateScope(params.scope, client)
    const { codeChallenge, codeChallengeMethod } = this.validatePkceParameters(
      params.codeChallenge,
      params.codeChallengeMethod,
      client.id
    )
    this.validateResponseType(params.responseType, client, codeChallenge, codeChallengeMethod)
  }

  private validateClientId(clientId: string | unknown): OAuth2Client {
    if (!clientId || typeof clientId !== 'string' || clientId.length === 0) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `Invalid request: client_id is required`,
        undefined,
        'Missing or invalid client_id in authorization request',
        { hasClientId: !!clientId, clientIdType: typeof clientId }
      )
    }

    const client = this.oAuth2ClientSubservice.findClientById(clientId)
    if (!client) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.UNAUTHORIZED_CLIENT,
        `Unauthorized client: unknown client`,
        undefined,
        'Client not found',
        { clientId: clientId }
      )
    }

    return client
  }

  private validateRedirectUri(redirectUri: string | unknown, client: OAuth2Client): string {
    if (!redirectUri || typeof redirectUri !== 'string' || redirectUri.length === 0) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `Invalid request: redirect_uri is required`,
        undefined,
        'Missing or invalid redirect_uri in authorization request',
        {
          clientId: client.id,
          hasRedirectUri: !!redirectUri,
          redirectUriType: typeof redirectUri,
        }
      )
    }

    if (!client.isRedirectUriAllowed(redirectUri)) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `Invalid request: provided redirect URI is not allowed for this client`,
        undefined,
        'Redirect URI not allowed for client',
        { clientId: client.id, redirectUri: redirectUri }
      )
    }

    return redirectUri
  }

  private validateScope(scope: string | unknown, client: OAuth2Client): string | undefined {
    if (scope === undefined) {
      return undefined
    }
    if (typeof scope !== 'string' || !client.areAllScopesAllowed(scope)) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.INVALID_SCOPE,
        `Invalid scope: requested scope is invalid, unknown, or malformed`,
        undefined,
        'Invalid scope requested',
        { clientId: client.id, requestedScope: scope }
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
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `Invalid request: both code_challenge and code_challenge_method must be provided when using PKCE`,
        undefined,
        'PKCE parameters incomplete',
        {
          clientId: clientId,
          hasCodeChallenge: !!codeChallenge,
          hasCodeChallengeMethod: !!codeChallengeMethod,
        }
      )
    }

    return { codeChallenge, codeChallengeMethod }
  }

  private validateResponseType(
    responseType: string | unknown,
    client: OAuth2Client,
    codeChallenge?: string,
    codeChallengeMethod?: string
  ): string {
    if (!responseType || typeof responseType !== 'string') {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.INVALID_REQUEST,
        `Invalid request: response_type is required`,
        undefined,
        'Missing or invalid response_type in authorization request',
        {
          clientId: client.id,
          hasResponseType: !!responseType,
          responseTypeValue: responseType,
        }
      )
    }

    if (!['code', 'token'].includes(responseType)) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.UNSUPPORTED_RESPONSE_TYPE,
        `Unsupported response_type: ${responseType} - must be "code" or "token"`,
        undefined,
        'Unsupported response_type',
        { clientId: client.id, responseType: responseType }
      )
    }

    if (client.requiresPkce) {
      if (!codeChallenge || !codeChallengeMethod) {
        throw this.oAuth2ErrorThrower.authorizationException(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          `Invalid request: PKCE is required for this client: code_challenge and code_challenge_method are required`,
          undefined,
          'PKCE required but not provided',
          {
            clientId: client.id,
            hasCodeChallenge: !!codeChallenge,
            hasCodeChallengeMethod: !!codeChallengeMethod,
          }
        )
      }

      if (responseType !== 'code') {
        throw this.oAuth2ErrorThrower.authorizationException(
          OAuth2AuthorizationErrorCode.INVALID_REQUEST,
          `Invalid request: response_type must be "code" when PKCE is required for this client`
        )
      }
    }

    if (responseType === 'token') {
      throw this.oAuth2ErrorThrower.authorizationException(
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

    throw this.oAuth2ErrorThrower.tokenException(
      OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE,
      `Unsupported grant type: ${params.grantType}`,
      undefined,
      'Unsupported grant type',
      { grantType: params.grantType }
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
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_CLIENT,
        'Invalid request: client_id is required',
        undefined,
        'Missing client_id in token request',
        { grantType, hasClientSecret: !!clientSecret }
      )
    }

    const client = this.oAuth2ClientSubservice.findClientById(clientId)
    if (!client) {
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_CLIENT,
        `Unauthorized client: unknown client`,
        undefined,
        'Client not found for token request',
        { clientId: clientId, grantType }
      )
    }

    // Only validate client_secret if client has one configured
    if (client.secret) {
      if (!clientSecret) {
        throw this.oAuth2ErrorThrower.tokenException(
          OAuth2TokenErrorCode.INVALID_CLIENT,
          'Invalid client: client_secret is required',
          undefined,
          'Client secret required but not provided',
          { clientId: clientId, grantType }
        )
      }
      if (!this.isValidSecret(client.secret, clientSecret)) {
        throw this.oAuth2ErrorThrower.tokenException(
          OAuth2TokenErrorCode.INVALID_CLIENT,
          'Invalid client: invalid client_secret',
          undefined,
          'Invalid client secret provided',
          {
            clientId: clientId,
            grantType,
            hasClientSecret: !!clientSecret,
          }
        )
      }
    }

    // Validate redirect_uri if present
    if (params.redirectUri && typeof params.redirectUri === 'string') {
      if (!client.isRedirectUriAllowed(params.redirectUri)) {
        throw this.oAuth2ErrorThrower.tokenException(
          OAuth2TokenErrorCode.INVALID_REQUEST,
          `Invalid request: provided redirect URI is not allowed for this client`,
          undefined,
          'Redirect URI not allowed for client in token request',
          {
            clientId: clientId,
            redirectUri: params.redirectUri,
            grantType,
          }
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
        throw this.oAuth2ErrorThrower.tokenException(
          OAuth2TokenErrorCode.INVALID_REQUEST,
          'Invalid request: PKCE code_verifier is required',
          undefined,
          'PKCE code_verifier required but not provided',
          {
            clientId: clientId,
            grantType: params.grantType,
            hasCodeVerifier: !!params.codeVerifier,
          }
        )
      }
    }
  }
}
