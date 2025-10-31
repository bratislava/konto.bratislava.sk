import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  AuthorizationRequestDto,
  RefreshTokenRequestDto,
  TokenRequestDto,
  TokenRequestUnion,
} from './dtos/requests.oauth2.dto'
import { AuthorizationResponseDto, TokenResponseDto } from './dtos/responses.oauth2.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { OAuth2ErrorThrower } from './oauth2-error.thrower'
import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from './oauth2.error.enum'
import { PrismaService } from '../prisma/prisma.service'
import { decryptData, encryptData } from '../utils/crypto'
import * as jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'node:crypto'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { OAuth2ValidationSubservice } from './subservices/oauth2-validation.subservice'

@Injectable()
export class OAuth2Service {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(OAuth2Service.name)

  constructor(
    private readonly oAuth2ErrorThrower: OAuth2ErrorThrower,
    private readonly prisma: PrismaService,
    private readonly cognitoSubservice: CognitoSubservice,
    private readonly validationSubservice: OAuth2ValidationSubservice,
    private readonly configService: ConfigService
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
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization server error: unknown authorization request',
        undefined,
        'Unknown authorization request ID',
        { authRequestId }
      )
    }

    // Extract expiration from JWT access token; if not present, assume 1 hour
    const accessTokenExpiresAt =
      this.extractJwtExpiration(accessToken) ?? new Date(Date.now() + 60 * 60 * 1000)

    // Encrypt tokens; encryptData can fail if CRYPTO_SECRET_KEY is not set
    let accessTokenEnc: string
    let idTokenEnc: string | null = null
    let refreshTokenEnc: string
    try {
      accessTokenEnc = encryptData(accessToken)
      if (idToken) {
        idTokenEnc = encryptData(idToken)
      }
      refreshTokenEnc = encryptData(refreshToken)
    } catch (error) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization server error: failed to process tokens',
        undefined,
        'Failed to encrypt tokens',
        { error, authRequestId }
      )
    }

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
    const oAuth2LoginUrl = this.configService.get<string>('OAUTH2_LOGIN_URL')
    if (!oAuth2LoginUrl) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization redirect error: server misconfiguration',
        undefined,
        'OAUTH2_LOGIN_URL environment variable is not configured',
        {
          clientId: request.client_id,
          authRequestId,
        }
      )
    }
    const redirectUrl = new URL(oAuth2LoginUrl)
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
  async token(request: TokenRequestUnion): Promise<TokenResponseDto> {
    this.logger.debug('Processing token request', { grant_type: request.grant_type })

    if (request.grant_type === 'authorization_code') {
      return this.exchangeCode(request)
    }
    if (request.grant_type === 'refresh_token') {
      return this.refreshToken(request)
    }

    throw this.oAuth2ErrorThrower.tokenException(
      OAuth2TokenErrorCode.UNSUPPORTED_GRANT_TYPE,
      `Unsupported grant type`,
      undefined,
      'Unsupported grant type. Should have been handled by the guard.'
    )
  }

  /**
   * Exchange authorization code for access token (with PKCE)
   * Implements RFC 7636 Section 4.3
   *
   * @returns Token response DTO with access_token, refresh_token, etc.
   */
  async exchangeCode(request: TokenRequestDto): Promise<TokenResponseDto> {
    this.logger.debug('Processing token exchange request', { hasCode: !!request.code })

    const oauth2Data = await this.prisma.oAuth2Data.findUnique({
      where: { authorizationCode: request.code },
    })

    if (!oauth2Data) {
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Invalid grant: authorization code not found',
        undefined,
        'Authorization code not found',
        { hasCode: !!request.code }
      )
    }

    // Delete immediately after finding the code to prevent race conditions (RFC 6749: codes are single-use)
    // If deletion fails (e.g., already deleted by another request), the code was invalid anyway
    try {
      await this.prisma.oAuth2Data.delete({
        where: { id: oauth2Data.id },
      })
    } catch (deleteError) {
      // Code was already used or deleted - treat as invalid grant
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Invalid grant: authorization code already used or deleted',
        undefined,
        'Authorization code already used or deleted',
        {
          error: deleteError,
          authRequestId: oauth2Data.id,
          clientId: oauth2Data.clientId,
        }
      )
    }

    if (!oauth2Data.authorizationCodeCreatedAt) {
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Invalid grant: authorization code missing creation timestamp',
        undefined,
        'Authorization code missing creation timestamp',
        {
          authRequestId: oauth2Data.id,
          clientId: oauth2Data.clientId,
        }
      )
    }
    const maxAge = 5 * 60 * 1000 // 5 minutes
    const codeAge = Date.now() - oauth2Data.authorizationCodeCreatedAt.getTime()
    if (codeAge > maxAge) {
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Invalid grant: authorization code expired',
        undefined,
        'Authorization code expired',
        {
          authRequestId: oauth2Data.id,
          clientId: oauth2Data.clientId,
          codeAgeMs: codeAge,
          maxAgeMs: maxAge,
        }
      )
    }

    if (oauth2Data.redirectUri !== request.redirect_uri) {
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_REQUEST,
        'Invalid request: redirect_uri mismatch',
        undefined,
        'Redirect URI mismatch', {
          authRequestId: oauth2Data.id,
          clientId: oauth2Data.clientId,
          storedRedirectUri: oauth2Data.redirectUri,
          requestedRedirectUri: request.redirect_uri,
        }
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
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Invalid grant: tokens not available for this authorization code',
        undefined,
        'Tokens not available for authorization code', {
          authRequestId: oauth2Data.id,
          clientId: oauth2Data.clientId,
          hasAccessToken: !!oauth2Data.accessTokenEnc,
          hasRefreshToken: !!oauth2Data.refreshTokenEnc,
          hasExpiresAt: !!oauth2Data.accessTokenExpiresAt,
        }
      )
    }

    const expiresIn = Math.floor((oauth2Data.accessTokenExpiresAt.getTime() - Date.now()) / 1000)

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
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_REQUEST,
        'Invalid request: invalid code_challenge_method',
        undefined,
        'Invalid code_challenge_method', {
          codeChallengeMethod,
          validMethods: ['S256', 'plain'],
        }
      )
    }

    if (!this.validationSubservice.isValidSecret(codeChallenge, expectedChallenge)) {
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_REQUEST,
        'Invalid request: invalid code_verifier',
        undefined,
        'PKCE code_verifier validation failed', {
          codeChallengeMethod,
          hasCodeVerifier: !!codeVerifier,
          hasCodeChallenge: !!codeChallenge,
        }
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
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_REQUEST,
        'Invalid request: client_id required',
        undefined,
        'Missing client_id in refresh token request'
      )
    }

    let refreshTokenPlain: string
    try {
      refreshTokenPlain = decryptData(request.refresh_token)
    } catch (error) {
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Invalid grant: invalid refresh token',
        undefined,
        'Failed to decrypt refresh token',
        { error, clientId }
      )
    }

    let refreshed: { accessToken?: string; idToken?: string }
    try {
      refreshed = await this.cognitoSubservice.refreshTokens(refreshTokenPlain, clientId)
    } catch (error) {
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Invalid grant: unable to refresh access token',
        undefined,
        'Failed to refresh tokens via Cognito',
        { error, clientId }
      )
    }

    if (!refreshed.accessToken) {
      throw this.oAuth2ErrorThrower.tokenException(
        OAuth2TokenErrorCode.INVALID_GRANT,
        'Invalid grant: unable to refresh access token',
        undefined,
        'No access token returned from Cognito refresh', {
          clientId,
          hasRefreshToken: !!refreshTokenPlain,
        }
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
