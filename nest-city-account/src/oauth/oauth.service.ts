import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common'
import axios, { AxiosError } from 'axios'
import { PartnerConfig } from './config/partner.config'
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

  constructor() {
    if (!process.env.AWS_COGNITO_REGION || !process.env.AWS_COGNITO_USERPOOL_ID) {
      throw new Error('AWS Cognito configuration is missing')
    }

    this.cognitoRegion = process.env.AWS_COGNITO_REGION
    this.cognitoUserPoolId = process.env.AWS_COGNITO_USERPOOL_ID

    // Cognito domain is typically in the format: https://{domain}.auth.{region}.amazoncognito.com
    // If you have a custom domain, use OAUTH_COGNITO_DOMAIN env var
    this.cognitoDomain =
      process.env.OAUTH_COGNITO_DOMAIN ||
      `https://${process.env.AWS_COGNITO_USERPOOL_ID}.auth.${this.cognitoRegion}.amazoncognito.com`
  }

  /**
   * Build Cognito authorization URL and redirect
   */
  buildAuthorizeUrl(authorizeDto: AuthorizeRequestDto, partner: PartnerConfig): string {
    // Validate redirect URI is allowed for this partner
    if (!partner.allowedRedirectUris.includes(authorizeDto.redirect_uri)) {
      throw new BadRequestException(
        `Redirect URI ${authorizeDto.redirect_uri} not allowed for this client`
      )
    }

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
    this.logger.log(`Redirecting to Cognito authorize URL for partner: ${partner.name}`)

    return authorizeUrl
  }

  /**
   * Exchange authorization code for tokens or refresh tokens
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

        // Validate redirect URI
        if (!partner.allowedRedirectUris.includes(tokenDto.redirect_uri)) {
          throw new BadRequestException(
            `Redirect URI ${tokenDto.redirect_uri} not allowed for this client`
          )
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
