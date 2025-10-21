import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common'
import axios, { AxiosError } from 'axios'
import { createHash } from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { PartnerConfig, findPartnerByClientId } from './config/partner.config'
import {
  TokenRequestDto,
  TokenResponseDto,
  UserInfoResponseDto,
  AuthorizeRequestDto,
} from './dtos/oauth.dto'

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name)

  private readonly cognitoRegion: string

  private readonly cognitoUserPoolId: string

  private readonly cognitoDomain: string

  private readonly frontendUrl: string

  private readonly frontendLoginUrl: string

  // In-memory storage for authorization codes
  // TODO: Use Redis in production for multi-instance deployments
  private readonly authCodeStorage = new Map<
    string,
    {
      accessToken: string
      clientId: string
      redirectUri: string
      scope: string
      codeChallenge?: string
      codeChallengeMethod?: string
      nonce?: string
      expiresAt: number
    }
  >()

  constructor() {
    if (!process.env.AWS_COGNITO_REGION || !process.env.AWS_COGNITO_USERPOOL_ID) {
      throw new Error('AWS Cognito configuration is missing')
    }

    if (!process.env.OAUTH_FRONTEND_URL) {
      throw new Error('OAUTH_FRONTEND_URL is required')
    }

    this.cognitoRegion = process.env.AWS_COGNITO_REGION
    this.cognitoUserPoolId = process.env.AWS_COGNITO_USERPOOL_ID

    // Cognito domain is typically in the format: https://{domain}.auth.{region}.amazoncognito.com
    // If you have a custom domain, use OAUTH_COGNITO_DOMAIN env var
    this.cognitoDomain =
      process.env.OAUTH_COGNITO_DOMAIN ||
      `https://${process.env.AWS_COGNITO_USERPOOL_ID}.auth.${this.cognitoRegion}.amazoncognito.com`

    // Frontend URLs
    this.frontendUrl = process.env.OAUTH_FRONTEND_URL // e.g., https://konto.bratislava.sk
    this.frontendLoginUrl = process.env.OAUTH_FRONTEND_LOGIN_URL || `${this.frontendUrl}/prihlasenie`
  }

  /**
   * Build login/session check URL
   * Frontend login page automatically:
   * - Checks if user is logged in (SSR)
   * - If logged in: redirects with access_token
   * - If not logged in: shows login form
   */
  buildLoginRedirectUrl(authorizeParams: AuthorizeRequestDto, partner: PartnerConfig): string {
    const baseUrl = process.env.OAUTH_BASE_URL || 'https://nest-city-account.bratislava.sk'
    
    // Build the return URL that frontend will redirect back to
    const returnParams = new URLSearchParams({
      response_type: authorizeParams.response_type,
      client_id: authorizeParams.client_id,
      redirect_uri: authorizeParams.redirect_uri,
    })

    if (authorizeParams.scope) returnParams.append('scope', authorizeParams.scope)
    if (authorizeParams.state) returnParams.append('state', authorizeParams.state)
    if (authorizeParams.code_challenge) returnParams.append('code_challenge', authorizeParams.code_challenge)
    if (authorizeParams.code_challenge_method) returnParams.append('code_challenge_method', authorizeParams.code_challenge_method)
    if (authorizeParams.nonce) returnParams.append('nonce', authorizeParams.nonce)
    
    const returnUrl = `${baseUrl}/oauth/authorize?${returnParams.toString()}`
    
    // Frontend login page with redirect parameter
    // If user is logged in, they'll be auto-redirected with access_token
    // If not, they'll see login form
    this.logger.log(`Building login redirect for partner: ${partner.name}`)
    return `${this.frontendLoginUrl}?redirect=${encodeURIComponent(returnUrl)}`
  }

  /**
   * Generate an authorization code directly from user's access token
   * This bypasses Cognito's OAuth authorize endpoint to avoid session cookie issues
   * between konto.bratislava.sk and Cognito's OAuth domain
   */
  async generateAuthorizationCode(
    accessToken: string,
    authorizeDto: AuthorizeRequestDto,
    partner: PartnerConfig
  ): Promise<string> {
    // Validate the access token by fetching user info
    try {
      await this.getUserInfo(accessToken)
    } catch (error) {
      this.logger.error('Invalid access token provided for authorization code generation', error)
      throw new UnauthorizedException('Invalid access token')
    }

    // Generate unique authorization code
    const authCode = uuidv4()

    // Store authorization code with associated data (expires in 5 minutes)
    this.authCodeStorage.set(authCode, {
      accessToken,
      clientId: partner.clientId,
      redirectUri: authorizeDto.redirect_uri,
      scope: authorizeDto.scope || 'openid profile email',
      codeChallenge: authorizeDto.code_challenge,
      codeChallengeMethod: authorizeDto.code_challenge_method,
      nonce: authorizeDto.nonce,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    })

    this.logger.log(`Generated authorization code for partner: ${partner.name}`)
    return authCode
  }

  /**
   * Exchange authorization code for tokens or refresh tokens
   * Note: redirect_uri is already validated by RedirectUriValidationGuard
   */
  async getToken(
    tokenDto: TokenRequestDto,
    partner: PartnerConfig
  ): Promise<TokenResponseDto> {
    // Check if this is our custom authorization code
    if (tokenDto.grant_type === 'authorization_code' && tokenDto.code) {
      const codeData = this.authCodeStorage.get(tokenDto.code)

      if (codeData) {
        // Our custom auth code! Exchange it directly
        return this.exchangeCustomAuthCode(tokenDto, partner, codeData)
      }
    }

    // Fall back to Cognito for other flows (refresh_token, client_credentials, etc.)
    return this.exchangeWithCognito(tokenDto, partner)
  }

  /**
   * Exchange our custom authorization code for tokens
   */
  private async exchangeCustomAuthCode(
    tokenDto: TokenRequestDto,
    partner: PartnerConfig,
    codeData: {
      accessToken: string
      clientId: string
      redirectUri: string
      scope: string
      codeChallenge?: string
      codeChallengeMethod?: string
      nonce?: string
      expiresAt: number
    }
  ): Promise<TokenResponseDto> {
    // Validate expiration
    if (codeData.expiresAt < Date.now()) {
      this.authCodeStorage.delete(tokenDto.code!)
      throw new UnauthorizedException('Authorization code expired')
    }

    // Validate client_id
    if (codeData.clientId !== partner.clientId) {
      throw new UnauthorizedException('Client ID mismatch')
    }

    // Validate redirect_uri
    if (codeData.redirectUri !== tokenDto.redirect_uri) {
      throw new BadRequestException('Redirect URI mismatch')
    }

    // Validate PKCE if present
    if (codeData.codeChallenge) {
      if (!tokenDto.code_verifier) {
        throw new BadRequestException('Code verifier is required for PKCE')
      }

      const isValid = this.validatePKCE(
        tokenDto.code_verifier,
        codeData.codeChallenge,
        codeData.codeChallengeMethod
      )

      if (!isValid) {
        throw new UnauthorizedException('Invalid code verifier')
      }
    }

    // Delete auth code (single use only)
    this.authCodeStorage.delete(tokenDto.code!)

    // Get user info to include in id_token
    const userInfo = await this.getUserInfo(codeData.accessToken)

    // Build id_token (simplified - in production, use proper JWT signing)
    const idToken = this.buildIdToken(userInfo, partner.clientId, codeData.nonce)

    this.logger.log(`Successfully exchanged custom auth code for partner: ${partner.name}`)

    // Return tokens
    // Note: The access_token from Amplify is already valid for this Cognito user pool
    return {
      access_token: codeData.accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: idToken,
      // Note: refresh_token would require storing it during initial login
      // For now, partners can't refresh these tokens
    }
  }

  /**
   * Exchange with Cognito (for non-custom auth codes)
   */
  private async exchangeWithCognito(
    tokenDto: TokenRequestDto,
    partner: PartnerConfig
  ): Promise<TokenResponseDto> {
    try {
      const tokenUrl = `${this.cognitoDomain}/oauth2/token`

      // Build request body based on grant type
      const body = new URLSearchParams()
      body.append('grant_type', tokenDto.grant_type)
      body.append('client_id', partner.clientId)

      if (tokenDto.grant_type === 'authorization_code') {
        if (!tokenDto.code) {
          throw new BadRequestException('Authorization code is required')
        }
        if (!tokenDto.redirect_uri) {
          throw new BadRequestException('Redirect URI is required for authorization_code grant')
        }

        body.append('code', tokenDto.code)
        body.append('redirect_uri', tokenDto.redirect_uri)

        if (tokenDto.code_verifier) {
          body.append('code_verifier', tokenDto.code_verifier)
        }
      } else if (tokenDto.grant_type === 'refresh_token') {
        if (!tokenDto.refresh_token) {
          throw new BadRequestException('Refresh token is required')
        }
        body.append('refresh_token', tokenDto.refresh_token)
      } else if (tokenDto.grant_type === 'client_credentials') {
        if (tokenDto.scope) {
          body.append('scope', tokenDto.scope)
        }
      }

      // Use partner's Cognito client secret for authentication with Cognito
      const authHeader = Buffer.from(
        `${partner.clientId}:${partner.cognitoClientSecret}`
      ).toString('base64')

      const response = await axios.post<TokenResponseDto>(tokenUrl, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authHeader}`,
        },
      })

      this.logger.log(`Token obtained successfully from Cognito for partner: ${partner.name}`)
      return response.data
    } catch (error) {
      this.handleCognitoError(error)
      throw error
    }
  }

  /**
   * Validate PKCE code challenge
   */
  private validatePKCE(
    verifier: string,
    challenge: string,
    method?: string
  ): boolean {
    if (method === 'S256') {
      const hash = createHash('sha256').update(verifier).digest('base64url')
      return hash === challenge
    } else {
      // plain method
      return verifier === challenge
    }
  }

  /**
   * Build a simple id_token JWT
   * Note: In production, use proper JWT library with signing
   */
  private buildIdToken(userInfo: UserInfoResponseDto, clientId: string, nonce?: string): string {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    }

    const payload = {
      sub: userInfo.sub,
      email: userInfo.email,
      email_verified: userInfo.email_verified,
      name: userInfo.name,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      aud: clientId,
      iss: `https://cognito-idp.${this.cognitoRegion}.amazonaws.com/${this.cognitoUserPoolId}`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...(nonce && { nonce }),
    }

    // TODO: In production, properly sign this JWT with Cognito's private key
    // For now, return a base64-encoded unsigned token (for testing only!)
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')

    return `${encodedHeader}.${encodedPayload}.UNSIGNED`
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken: string): Promise<UserInfoResponseDto> {
    try {
      const userInfoUrl = `${this.cognitoDomain}/oauth2/userInfo`

      const response = await axios.get<UserInfoResponseDto>(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      this.logger.log('UserInfo retrieved successfully')
      return response.data
    } catch (error) {
      this.handleCognitoError(error)
      throw error
    }
  }

  /**
   * Revoke a token (access token or refresh token)
   */
  async revokeToken(token: string, partner: PartnerConfig): Promise<void> {
    try {
      const revokeUrl = `${this.cognitoDomain}/oauth2/revoke`

      // Use partner's Cognito client secret for authentication with Cognito
      const authHeader = Buffer.from(`${partner.clientId}:${partner.cognitoClientSecret}`).toString(
        'base64'
      )

      const body = new URLSearchParams()
      body.append('token', token)

      await axios.post(revokeUrl, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authHeader}`,
        },
      })

      this.logger.log(`Token revoked successfully for partner: ${partner.name}`)
    } catch (error) {
      this.handleCognitoError(error)
      throw error
    }
  }

  /**
   * Get JWKS (JSON Web Key Set) from Cognito
   */
  async getJwks(): Promise<unknown> {
    try {
      const jwksUrl = `https://cognito-idp.${this.cognitoRegion}.amazonaws.com/${this.cognitoUserPoolId}/.well-known/jwks.json`

      const response = await axios.get(jwksUrl)

      this.logger.log('JWKS retrieved successfully')
      return response.data
    } catch (error) {
      this.handleCognitoError(error)
      throw error
    }
  }

  /**
   * Get OpenID configuration
   */
  getOpenIdConfiguration(): Record<string, unknown> {
    const baseUrl = process.env.OAUTH_BASE_URL || 'https://nest-city-account.bratislava.sk'

    return {
      issuer: `https://cognito-idp.${this.cognitoRegion}.amazonaws.com/${this.cognitoUserPoolId}`,
      authorization_endpoint: `${baseUrl}/oauth/authorize`,
      token_endpoint: `${baseUrl}/oauth/token`,
      userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
      jwks_uri: `${baseUrl}/oauth/.well-known/jwks.json`,
      end_session_endpoint: `${baseUrl}/oauth/logout`,
      response_types_supported: ['code', 'token'],
      grant_types_supported: ['authorization_code', 'refresh_token', 'client_credentials'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: ['openid', 'profile', 'email', 'phone', 'aws.cognito.signin.user.admin'],
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
      claims_supported: [
        'sub',
        'email',
        'email_verified',
        'name',
        'given_name',
        'family_name',
        'phone_number',
        'phone_number_verified',
      ],
      code_challenge_methods_supported: ['S256', 'plain'],
    }
  }

  /**
   * Build logout URL that logs out from Cognito and redirects to specified URI
   */
  buildLogoutUrl(clientId?: string, logoutUri?: string, state?: string): string {
    let redirectUri = logoutUri

    // Validate logout URI if provided with client ID
    if (clientId && logoutUri) {
      const partner = findPartnerByClientId(clientId)

      if (partner && !partner.allowedRedirectUris.includes(logoutUri)) {
        this.logger.warn(
          `Logout URI ${logoutUri} not allowed for client ${clientId}, using default`
        )
        redirectUri = undefined
      }
    }

    // Default logout redirect - your app's home page or login page
    if (!redirectUri) {
      redirectUri = this.frontendLoginUrl
    }

    // Append state if provided
    if (state && redirectUri) {
      const separator = redirectUri.includes('?') ? '&' : '?'
      redirectUri = `${redirectUri}${separator}state=${encodeURIComponent(state)}`
    }

    // Build Cognito logout URL
    const logoutParams = new URLSearchParams({
      logout_uri: redirectUri,
    })

    if (clientId) {
      logoutParams.append('client_id', clientId)
    }

    const cognitoLogoutUrl = `${this.cognitoDomain}/logout?${logoutParams.toString()}`
    this.logger.log(`Building logout URL with redirect to: ${redirectUri}`)

    return cognitoLogoutUrl
  }

  /**
   * Handle errors from Cognito API
   */
  private handleCognitoError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      const status = axiosError.response?.status
      const data = axiosError.response?.data as Record<string, unknown>

      this.logger.error(
        `Cognito API error: ${status} - ${JSON.stringify(data)}`,
        axiosError.stack
      )

      if (status === 400) {
        throw new BadRequestException(
          data?.error_description || data?.error || 'Invalid request to Cognito'
        )
      } else if (status === 401 || status === 403) {
        throw new UnauthorizedException(
          data?.error_description || data?.error || 'Unauthorized'
        )
      }
    } else {
      this.logger.error('Unknown error from Cognito', error)
    }
  }
}
