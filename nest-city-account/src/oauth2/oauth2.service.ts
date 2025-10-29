import { Injectable } from '@nestjs/common'
import {
  AuthorizationRequestDto,
  RefreshTokenRequestDto,
  TokenRequestDto,
} from './dtos/requests.oauth2.dto'
import {
  AuthorizationResponseDto,
  TokenResponseDto,
} from './dtos/responses.oautuh2.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@Injectable()
export class OAuth2Service {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(OAuth2Service.name)

  /**
   * Build frontend redirect URL for authorization request
   * Includes redirect_uri and state for frontend error handling
   * 
   * @param request - Authorization request DTO with all parameters
   * @param payloadUuid - UUID of the stored authorization request
   * @returns Redirect URL to frontend with client_id, payload, redirect_uri, and state parameters
   */
  buildLoginRedirectUrl(
    request: AuthorizationRequestDto,
    payloadUuid: string
  ): string {
    // TODO: Get frontend URL from environment variable or configuration service
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000' // FIXME: Use actual frontend URL config
    const redirectUrl = new URL('/oauth2/auth', frontendUrl)
    redirectUrl.searchParams.set('client_id', request.client_id)
    redirectUrl.searchParams.set('payload', payloadUuid)
    redirectUrl.searchParams.set('redirect_uri', request.redirect_uri)
    if (request.state) {
      redirectUrl.searchParams.set('state', request.state)
    }
    return redirectUrl.toString()
  }

  /**
   * Handle OAuth2 authorization request
   * Stores authorization request parameters and generates payload UUID
   * 
   * @returns Payload UUID that references the stored authorization request
   */
  async authorize(request: AuthorizationRequestDto): Promise<string> {
    this.logger.debug('Processing authorization request', { client_id: request.client_id })

    // TODO: Implement authorization logic
    // 1. Validate client_id (already done in guard)
    // 2. Validate redirect_uri (already done in guard)
    // 3. Validate scope (already done in guard)
    // 4. Store authorization request parameters in database
    // 5. Generate and return payload UUID that references the stored request
    // Controller will build redirect URL using buildLoginRedirectUrl()

    throw new Error('Authorization endpoint not yet implemented')
  }

  /**
   * Handle OAuth2 token request
   * Routes to appropriate handler based on grant_type
   * Implements RFC 6749 Section 5
   * 
   * @returns Token response DTO per RFC 6749 Section 5.1
   */
  async token(request: TokenRequestDto | RefreshTokenRequestDto): Promise<TokenResponseDto> {
    this.logger.debug('Processing token request', { grant_type: request.grant_type })

    if (request.grant_type === 'authorization_code') {
      return await this.exchangeCode(request as TokenRequestDto)
    } else if (request.grant_type === 'refresh_token') {
      return await this.refreshToken(request as RefreshTokenRequestDto)
    } else {
      throw new Error(`Unsupported grant_type: ${request.grant_type}`)
    }
  }

  /**
   * Exchange authorization code for access token (with PKCE)
   * Implements RFC 7636 Section 4.3
   * 
   * @returns Token response DTO with access_token, refresh_token, etc.
   */
  async exchangeCode(request: TokenRequestDto): Promise<TokenResponseDto> {
    this.logger.debug('Processing token exchange request', { code: request.code })

    // TODO: Implement token exchange logic
    // 1. Validate authorization code
    // 2. Verify PKCE code_verifier matches code_challenge
    // 3. Validate redirect_uri matches original request
    // 4. Generate access token and refresh token
    // 5. Return TokenResponseDto (controller will return JSON response per RFC 6749 Section 5.1)

    throw new Error('Token exchange endpoint not yet implemented')
  }

  /**
   * Refresh access token using refresh token
   * Implements RFC 6749 Section 6
   * 
   * @returns Token response DTO with new access_token and expiration time
   */
  async refreshToken(request: RefreshTokenRequestDto): Promise<TokenResponseDto> {
    this.logger.debug('Processing refresh token request')

    // TODO: Implement refresh token logic
    // 1. Validate refresh token
    // 2. Validate client credentials (if required)
    // 3. Generate new access token
    // 4. Optionally issue new refresh token
    // 5. Return TokenResponseDto (controller will return JSON response per RFC 6749 Section 5.1)

    throw new Error('Refresh token endpoint not yet implemented')
  }

  /**
   * Store tokens for a user/session
   * Called during the continue flow to persist authentication tokens
   */
  async storeTokens(
    accessToken: string,
    idToken: string | undefined,
    refreshToken: string | undefined,
    authorizationCode: string
  ): Promise<void> {
    this.logger.debug('Storing tokens associated with code', { authorizationCode })

    // TODO: Implement token storage logic
    // 1. Store access_token, id_token, refresh_token
    // 2. Associate with user ID
    // 3. Store expiration times
    // 4. Handle token refresh logic
  }

  /**
   * Load authorization request parameters from database using payload UUID
   * 
   * @param payloadUuid - UUID of the stored authorization request
   * @returns Authorization request parameters or undefined if not found
   */
  async loadAuthorizationRequestFromPayload(
    payloadUuid: string
  ): Promise<AuthorizationRequestDto | undefined> {
    this.logger.debug('Loading authorization request from payload', { payloadUuid })

    // TODO: Implement database lookup
    // 1. Query database for authorization request with this UUID
    // 2. Return stored AuthorizationRequestDto if found
    // 3. Return undefined if not found or expired

    throw new Error('loadAuthorizationRequestFromPayload not yet implemented')
  }

  /**
   * Build client redirect URL for authorization response
   * Implements RFC 6749 Section 4.1.2
   * 
   * @param redirectUri - Client's redirect URI (validated in guard)
   * @param response - Authorization response DTO
   * @returns Redirect URL to client's redirect_uri with code and state query parameters
   */
  buildAuthorizationResponseRedirectUrl(
    redirectUri: string,
    response: AuthorizationResponseDto
  ): string {
    const redirectUrl = new URL(redirectUri)
    redirectUrl.searchParams.set('code', response.code)
    if (response.state) {
      redirectUrl.searchParams.set('state', response.state)
    }
    return redirectUrl.toString()
  }

  /**
   * Continue authorization flow after user authentication
   * Generates authorization code and returns authorization response
   * 
   * Flow:
   * 1. authorize endpoint → redirects to FE for user authentication
   * 2. FE → calls continue endpoint with tokens and payload UUID
   * 3. continue endpoint → generates authorization code and redirects (303) to client's redirect_uri
   * 
   * @returns Authorization response DTO with code and state (if present)
   */
  async continueAuthorization(
    authorizationRequest: AuthorizationRequestDto,
    accessToken: string,
    idToken: string | undefined,
    refreshToken: string | undefined,
  ): Promise<AuthorizationResponseDto> {
    this.logger.debug('Continuing authorization flow', { client_id: authorizationRequest.client_id })

    // TODO: Implement continue logic
    // 1. Extract user info from tokens (decode JWT if needed)
    // 2. Store tokens using storeTokens()
    // 3. Generate authorization code
    // 4. Store code_challenge for PKCE verification
    // 5. Associate code with original authorization request
    // 6. Return AuthorizationResponseDto with code and optional state
    // Controller will build redirect URL using buildAuthorizationResponseRedirectUrl()

    throw new Error('Continue authorization endpoint not yet implemented')
  }
}
