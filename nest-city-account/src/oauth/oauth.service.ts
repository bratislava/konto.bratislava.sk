import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common'
import axios, { AxiosError } from 'axios'
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
   * Build Cognito OAuth authorization URL
   * Frontend will redirect to this after user logs in with Amplify
   * Cognito recognizes the Amplify session and auto-approves
   */
  buildCognitoAuthorizeUrl(
    authorizeDto: AuthorizeRequestDto,
    partner: PartnerConfig
  ): string {
    const params = new URLSearchParams({
      response_type: authorizeDto.response_type,
      client_id: partner.clientId,
      redirect_uri: authorizeDto.redirect_uri,
      scope: authorizeDto.scope || 'openid profile email',
    })

    if (authorizeDto.state) {
      params.append('state', authorizeDto.state)
    }

    if (authorizeDto.code_challenge) {
      params.append('code_challenge', authorizeDto.code_challenge)
    }

    if (authorizeDto.code_challenge_method) {
      params.append('code_challenge_method', authorizeDto.code_challenge_method)
    }

    if (authorizeDto.nonce) {
      params.append('nonce', authorizeDto.nonce)
    }

    const authorizeUrl = `${this.cognitoDomain}/oauth2/authorize?${params.toString()}`
    this.logger.log(`Building Cognito authorize URL for partner: ${partner.name}`)

    return authorizeUrl
  }

  /**
   * Get frontend login URL
   */
  getFrontendLoginUrl(): string {
    return this.frontendLoginUrl
  }

  /**
   * Exchange authorization code for tokens or refresh tokens
   * Proxies to Cognito's token endpoint
   */
  async getToken(
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

      this.logger.log(`Token obtained successfully for partner: ${partner.name}`)
      return response.data
    } catch (error) {
      this.handleCognitoError(error)
      throw error
    }
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
