import { Injectable } from '@nestjs/common'
import {
  AuthorizationRequestDto,
  RefreshTokenRequestDto,
  TokenRequestDto,
} from './dtos/requests.oauth2.dto'
import { AuthorizationResponseDto, TokenResponseDto } from './dtos/responses.oautuh2.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { OAuth2TokenErrorCode } from './oauth2.error.enum'
import { PrismaService } from '../prisma/prisma.service'
import { decryptData, encryptData } from '../utils/crypto'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import * as jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'node:crypto'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { OAuth2ValidationSubservice } from './subservices/oauth2-validation.subservice'

@Injectable()
export class OAuth2Service {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(OAuth2Service.name)

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly prisma: PrismaService,
    private readonly cognitoSubservice: CognitoSubservice,
    private readonly validationSubservice: OAuth2ValidationSubservice
  ) {}

  /**
   * Store OAuth2 authorization request parameters and return its ID
   *
   * @returns Authorization request ID that references the stored authorization request
   */
  async storeAuthorizationRequest(request: AuthorizationRequestDto): Promise<string> {
    this.logger.debug('Processing authorization request', { client_id: request.client_id })

    const storedRequest = await this.prisma.oAuth2Data.create({
      data: {
        responseType: request.response_type,
        clientId: request.client_id,
        redirectUri: request.redirect_uri,
        scope: request.scope || null,
        state: request.state || null,
        codeChallenge: request.code_challenge || null,
        codeChallengeMethod: request.code_challenge_method || null,
      },
    })

    this.logger.debug('Authorization request stored', {
      authRequestId: storedRequest.id,
      clientId: request.client_id,
    })

    return storedRequest.id
  }

  /**
   * Load authorization request parameters from database using authorization request ID
   *
   * @param authRequestId - ID of the stored authorization request
   * @returns Authorization request parameters or undefined if not found
   */
  async loadAuthorizationRequest(
    authRequestId: string
  ): Promise<AuthorizationRequestDto | undefined> {
    this.logger.debug('Loading authorization request from database', { authRequestId })

    const storedRequest = await this.prisma.oAuth2Data.findUnique({
      where: { id: authRequestId },
    })

    if (!storedRequest) {
      this.logger.debug('Authorization request not found', { authRequestId })
      return undefined
    }

    const request: AuthorizationRequestDto = {
      response_type: storedRequest.responseType,
      client_id: storedRequest.clientId,
      redirect_uri: storedRequest.redirectUri,
      scope: storedRequest.scope || undefined,
      state: storedRequest.state || undefined,
      code_challenge: storedRequest.codeChallenge || undefined,
      code_challenge_method: storedRequest.codeChallengeMethod || undefined,
    }

    return request
  }

  /**
   * Store tokens for an authorization request
   * Called by POST /continue endpoint to store tokens before authorization grant generation
   */
  async storeTokensForAuthRequest(
    authRequestId: string,
    accessToken: string,
    idToken: string | undefined,
    refreshToken: string
  ): Promise<void> {
    this.logger.debug('Storing tokens for authorization request', {
      authRequestId: authRequestId,
      hasAccessToken: !!accessToken,
      hasIdToken: !!idToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      idTokenLength: idToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
    })

    // Ensure the authorization request exists
    const existingRequest = await this.prisma.oAuth2Data.findUnique({
      where: { id: authRequestId },
      select: { id: true },
    })
    if (!existingRequest) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Unknown authorization request ID'
      )
    }

    // Extract expiration from JWT access token; if not present, assume 1 hour
    const accessTokenExpiresAt =
      this.extractJwtExpiration(accessToken) ?? new Date(Date.now() + 60 * 60 * 1000)

    // Encrypt tokens; encryptData already returns base64
    const accessTokenEnc = encryptData(accessToken)
    const idTokenEnc = idToken ? encryptData(idToken) : null
    const refreshTokenEnc = encryptData(refreshToken)

    // Update tokens on the same OAuth2Data row
    await this.prisma.oAuth2Data.update({
      where: { id: authRequestId },
      data: {
        accessTokenEnc,
        accessTokenExpiresAt,
        idTokenEnc,
        refreshTokenEnc,
      },
    })
  }

  private extractJwtExpiration(jwtToken: string): Date | undefined {
    const decoded = jwt.decode(jwtToken) as jwt.JwtPayload | null
    if (typeof decoded?.exp === 'number') {
      return new Date(decoded.exp * 1000)
    }
    return undefined
  }

  /**
   * Build frontend redirect URL for authorization request
   * Includes redirect_uri and state for frontend error handling
   *
   * @param request - Authorization request DTO with all parameters
   * @param authRequestId - ID of the stored authorization request
   * @returns Redirect URL to frontend with client_id, payload, redirect_uri, and state parameters
   */
  buildLoginRedirectUrl(request: AuthorizationRequestDto, authRequestId: string): string {
    // TODO: Get frontend URL from environment variable or configuration service
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000' // FIXME: Use actual frontend URL config
    const redirectUrl = new URL('/oauth2/auth', frontendUrl)
    redirectUrl.searchParams.set('client_id', request.client_id)
    redirectUrl.searchParams.set('payload', authRequestId)
    redirectUrl.searchParams.set('redirect_uri', request.redirect_uri)
    if (request.state) {
      redirectUrl.searchParams.set('state', request.state)
    }
    return redirectUrl.toString()
  }

  /**
   * Check if tokens are stored for an authorization request
   *
   * @param authRequestId - ID of the authorization request
   * @returns True if tokens are stored and ready
   */
  async areTokensStoredForAuthRequest(authRequestId: string): Promise<boolean> {
    this.logger.debug('Checking if tokens are stored for authorization request', { authRequestId })

    const row = await this.prisma.oAuth2Data.findUnique({
      where: { id: authRequestId },
      select: { accessTokenEnc: true, refreshTokenEnc: true, accessTokenExpiresAt: true },
    })
    return !!(row && row.accessTokenEnc && row.refreshTokenEnc && row.accessTokenExpiresAt)
  }

  /**
   * Continue authorization flow after tokens are stored
   * Generates authorization code and returns authorization response
   *
   * Flow:
   * 1. authorize endpoint → redirects to FE for user authentication
   * 2. FE → calls POST /continue with tokens and authorization request ID (stores tokens)
   * 3. FE → calls GET /continue with authorization request ID (generates grant and redirects)
   *
   * @param authRequestId - ID of the authorization request
   * @param authorizationRequest - Authorization request parameters (already validated)
   * @returns Authorization response DTO with code and state (if present)
   */
  async continueAuthorization(
    authRequestId: string,
    authorizationRequest: AuthorizationRequestDto
  ): Promise<AuthorizationResponseDto> {
    this.logger.debug('Continuing authorization flow', {
      client_id: authorizationRequest.client_id,
      authRequestId,
    })

    const authorizationCode = randomBytes(64).toString('base64url')

    await this.prisma.oAuth2Data.update({
      where: { id: authRequestId },
      data: { authorizationCode, authorizationCodeCreatedAt: new Date() },
    })

    this.logger.debug('Authorization code generated and stored', {
      authRequestId,
      client_id: authorizationRequest.client_id,
    })

    const response: AuthorizationResponseDto = {
      code: authorizationCode,
      ...(authorizationRequest.state && { state: authorizationRequest.state }),
    }

    return response
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
   * Handle OAuth2 token request
   * Routes to appropriate handler based on grant_type
   * Implements RFC 6749 Section 5
   *
   * @returns Token response DTO per RFC 6749 Section 5.1
   */
  async token(request: TokenRequestDto | RefreshTokenRequestDto): Promise<TokenResponseDto> {
    this.logger.debug('Processing token request', { grant_type: request.grant_type })

    if (request.grant_type === 'authorization_code') {
      return this.exchangeCode(request as TokenRequestDto)
    } else if (request.grant_type === 'refresh_token') {
      return this.refreshToken(request as RefreshTokenRequestDto)
    } else {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE,
        `Unsupported grant_type: ${request.grant_type}`
      )
    }
  }

  /**
   * Exchange authorization code for access token (with PKCE)
   * Implements RFC 7636 Section 4.3
   *
   * @returns Token response DTO with access_token, refresh_token, etc.
   */
  async exchangeCode(request: TokenRequestDto): Promise<TokenResponseDto> {
    this.logger.debug('Processing token exchange request', { hasCode: !!request.code })

    const oauth2Data = await this.prisma.oAuth2Data.findFirst({
      where: { authorizationCode: request.code },
    })

    if (!oauth2Data) {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Invalid authorization code'
      )
    }

    if (!oauth2Data.authorizationCodeCreatedAt) {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Authorization code expired'
      )
    }
    const maxAge = 5 * 60 * 1000 // 5 minutes
    const codeAge = Date.now() - oauth2Data.authorizationCodeCreatedAt.getTime()
    if (codeAge > maxAge) {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Authorization code expired'
      )
    }

    if (oauth2Data.redirectUri !== request.redirect_uri) {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_REQUEST,
        'redirect_uri mismatch'
      )
    }

    if (oauth2Data.codeChallenge) {
      this.validatePkce(
        request.code_verifier,
        oauth2Data.codeChallenge,
        oauth2Data.codeChallengeMethod
      )
    }

    if (
      !oauth2Data.accessTokenEnc ||
      !oauth2Data.refreshTokenEnc ||
      !oauth2Data.accessTokenExpiresAt
    ) {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Tokens not available for this authorization code'
      )
    }

    const expiresIn = Math.floor((oauth2Data.accessTokenExpiresAt.getTime() - Date.now()) / 1000)

    // Delete the OAuth2Data row (authorization code is single-use)
    await this.prisma.oAuth2Data.delete({
      where: { id: oauth2Data.id },
    })

    this.logger.debug('Authorization code exchanged successfully', {
      clientId: oauth2Data.clientId,
    })

    // Build and return response
    const response: TokenResponseDto = {
      access_token: oauth2Data.accessTokenEnc,
      token_type: 'Bearer',
      expires_in: Math.max(0, expiresIn),
      refresh_token: oauth2Data.refreshTokenEnc,
      ...(oauth2Data.scope && { scope: oauth2Data.scope }),
    }

    return response
  }

  /**
   * Validate PKCE code_verifier against stored code_challenge
   * Implements RFC 7636 Section 4.6
   *
   * @param codeVerifier - The code verifier from the token request
   * @param codeChallenge - The code challenge stored during authorization
   * @param codeChallengeMethod - The challenge method ('S256' or 'plain')
   */
  private validatePkce(
    codeVerifier: string,
    codeChallenge: string,
    codeChallengeMethod: string | null
  ): void {
    let expectedChallenge: string

    if (codeChallengeMethod === 'S256') {
      // S256: SHA256(code_verifier) base64url-encoded
      const hash = createHash('sha256').update(codeVerifier).digest()
      expectedChallenge = hash.toString('base64url')
    } else if (codeChallengeMethod === 'plain') {
      // Plain: code_verifier itself
      expectedChallenge = codeVerifier
    } else {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_REQUEST,
        'Invalid code_challenge_method'
      )
    }

    // Use timing-safe comparison from validation subservice
    if (!this.validationSubservice.isValidSecret(codeChallenge, expectedChallenge)) {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_REQUEST,
        'Invalid code_verifier'
      )
    }
  }

  /**
   * Refresh access token using refresh token
   * Implements RFC 6749 Section 6
   *
   * @param request - Refresh token request DTO

   * @returns Token response DTO with new access_token and expiration time
   */
  async refreshToken(request: RefreshTokenRequestDto): Promise<TokenResponseDto> {
    const clientId = request.client_id
    this.logger.debug('Processing refresh token request', {
      grant_type: request.grant_type,
      hasRefreshToken: !!request.refresh_token,
      clientId,
    })

    if (!clientId) {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_CLIENT,
        'Invalid client credentials'
      )
    }

    let refreshTokenPlain: string
    try {
      refreshTokenPlain = decryptData(request.refresh_token)
    } catch (_) {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_REQUEST,
        'Invalid refresh token'
      )
    }

    const refreshed = await this.cognitoSubservice.refreshTokens(refreshTokenPlain, clientId)
    // FIXME try catch refreshTokens

    if (!refreshed.accessToken) {
      throw this.throwerErrorGuard.OAuth2TokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Unable to refresh access token'
      )
    }

    // Compute expires_in from JWT exp (default 3600 if missing)
    let expiresIn = 3600
    try {
      const decoded = jwt.decode(refreshed.accessToken) as { exp?: number } | null
      if (typeof decoded?.exp === 'number') {
        const secondsUntilExp = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000))
        expiresIn = secondsUntilExp
      }
    } catch (_) {
      // keep default
    }

    const response: TokenResponseDto = {
      access_token: refreshed.accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
    }

    return response
  }
}
