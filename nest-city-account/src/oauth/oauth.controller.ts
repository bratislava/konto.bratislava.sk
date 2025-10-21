import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBasicAuth,
  ApiBody,
} from '@nestjs/swagger'
import { Response } from 'express'
import { OAuthService } from './oauth.service'
import { PartnerAuthGuard, RequestWithPartner } from './guards/partner-auth.guard'
import { PartnerClientIdGuard } from './guards/partner-client-id.guard'
import { findPartnerByClientId } from './config/partner.config'
import {
  AuthorizeRequestDto,
  TokenRequestDto,
  TokenResponseDto,
  UserInfoResponseDto,
  OAuthErrorDto,
  OpenIdConfigurationDto,
  RevokeTokenRequestDto,
} from './dtos/oauth.dto'

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Authorization endpoint - initiates OAuth flow
   * Redirects to frontend login page, which after login redirects to Cognito's OAuth authorize
   * Cognito recognizes the Amplify session and auto-approves the OAuth request
   */
  @Get('authorize')
  @UseGuards(PartnerClientIdGuard)
  @ApiOperation({
    summary: 'OAuth Authorization Endpoint',
    description:
      'Initiates the OAuth 2.0 authorization code flow. Redirects to custom login page, then to Cognito OAuth authorize.',
  })
  @ApiQuery({ name: 'response_type', required: true, enum: ['code', 'token'] })
  @ApiQuery({ name: 'client_id', required: true, type: String })
  @ApiQuery({ name: 'redirect_uri', required: true, type: String })
  @ApiQuery({ name: 'scope', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'code_challenge', required: false, type: String })
  @ApiQuery({ name: 'code_challenge_method', required: false, enum: ['S256', 'plain'] })
  @ApiQuery({ name: 'nonce', required: false, type: String })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend login with Cognito OAuth redirect parameter',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: OAuthErrorDto,
  })
  async authorize(
    @Query() authorizeDto: AuthorizeRequestDto,
    @Req() req: RequestWithPartner,
    @Res() res: Response
  ): Promise<void> {
    if (!req.partner) {
      throw new UnauthorizedException('Invalid partner')
    }

    // Build Cognito OAuth authorize URL that frontend will redirect to after login
    const cognitoAuthorizeUrl = this.oauthService.buildCognitoAuthorizeUrl(
      authorizeDto,
      req.partner
    )

    // Build frontend login URL with cognito_redirect parameter
    const loginUrl = new URL(this.oauthService.getFrontendLoginUrl())
    loginUrl.searchParams.set('cognito_redirect', cognitoAuthorizeUrl)

    // Redirect to login page
    // If user is already logged in, frontend SSR will redirect directly to Cognito (SSO)
    // If not logged in, user logs in, then frontend redirects to Cognito
    // Cognito recognizes the Amplify session and auto-approves
    res.redirect(loginUrl.toString())
  }

  /**
   * Token endpoint - exchanges authorization code for tokens
   * Proxies to Cognito's token endpoint
   */
  @Post('token')
  @HttpCode(200)
  @UseGuards(PartnerAuthGuard)
  @ApiOperation({
    summary: 'OAuth Token Endpoint',
    description:
      'Exchanges authorization code for access token, ID token, and refresh token. Also supports refresh token grant.',
  })
  @ApiBasicAuth('client_credentials')
  @ApiBody({ type: TokenRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully obtained',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: OAuthErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid client credentials',
    type: OAuthErrorDto,
  })
  async token(
    @Body() tokenDto: TokenRequestDto,
    @Req() req: RequestWithPartner
  ): Promise<TokenResponseDto> {
    if (!req.partner) {
      throw new UnauthorizedException('Invalid partner')
    }

    // PartnerAuthGuard already validated client_id and client_secret
    return this.oauthService.getToken(tokenDto, req.partner)
  }

  /**
   * UserInfo endpoint - returns user information
   * Proxies to Cognito's userinfo endpoint
   */
  @Get('userinfo')
  @HttpCode(200)
  @ApiOperation({
    summary: 'OAuth UserInfo Endpoint',
    description: 'Returns information about the authenticated user using the access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User information',
    type: UserInfoResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing access token',
    type: OAuthErrorDto,
  })
  async userInfo(
    @Headers('authorization') authorization: string
  ): Promise<UserInfoResponseDto> {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token is required')
    }

    const accessToken = authorization.substring('Bearer '.length)
    return this.oauthService.getUserInfo(accessToken)
  }

  /**
   * JWKS endpoint - returns JSON Web Key Set
   * Proxies to Cognito's JWKS endpoint
   */
  @Get('.well-known/jwks.json')
  @HttpCode(200)
  @ApiOperation({
    summary: 'JWKS Endpoint',
    description: 'Returns the JSON Web Key Set (JWKS) for token verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'JWKS',
  })
  async jwks(): Promise<unknown> {
    return this.oauthService.getJwks()
  }

  /**
   * OpenID Configuration endpoint
   * Returns OpenID Connect discovery document
   */
  @Get('.well-known/openid-configuration')
  @HttpCode(200)
  @ApiOperation({
    summary: 'OpenID Configuration Endpoint',
    description: 'Returns the OpenID Connect discovery document.',
  })
  @ApiResponse({
    status: 200,
    description: 'OpenID Configuration',
    type: OpenIdConfigurationDto,
  })
  getOpenIdConfiguration(): Record<string, unknown> {
    return this.oauthService.getOpenIdConfiguration()
  }

  /**
   * Revocation endpoint - revokes tokens
   * Proxies to Cognito's revoke endpoint
   */
  @Post('revoke')
  @HttpCode(200)
  @UseGuards(PartnerAuthGuard)
  @ApiOperation({
    summary: 'OAuth Token Revocation Endpoint',
    description: 'Revokes an access token or refresh token.',
  })
  @ApiBasicAuth('client_credentials')
  @ApiBody({ type: RevokeTokenRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Token successfully revoked',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: OAuthErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid client credentials',
    type: OAuthErrorDto,
  })
  async revoke(
    @Body() revokeDto: RevokeTokenRequestDto,
    @Req() req: RequestWithPartner
  ): Promise<void> {
    if (!req.partner) {
      throw new UnauthorizedException('Invalid partner')
    }

    // Revoke the token via Cognito
    await this.oauthService.revokeToken(revokeDto.token, req.partner)
  }

  /**
   * Logout endpoint - handles OAuth logout with optional redirect
   * Redirects to frontend to clear session, then frontend redirects back
   */
  @Get('logout')
  @HttpCode(302)
  @ApiOperation({
    summary: 'OAuth Logout Endpoint',
    description:
      'Logs out the user and optionally redirects to a specified URL. ' +
      'Redirects to frontend to clear Amplify session.',
  })
  @ApiQuery({
    name: 'client_id',
    required: false,
    type: String,
    description: 'Client ID of the partner requesting logout',
  })
  @ApiQuery({
    name: 'logout_uri',
    required: false,
    type: String,
    description: 'URI to redirect to after logout (must be in allowed redirect URIs)',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    type: String,
    description: 'State parameter to include in redirect',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend logout page',
  })
  async logout(
    @Query('client_id') clientId: string,
    @Query('logout_uri') logoutUri: string,
    @Query('state') state: string,
    @Res() res: Response
  ): Promise<void> {
    // Validate logout URI if provided
    if (clientId && logoutUri) {
      const partner = findPartnerByClientId(clientId)

      if (partner && !partner.allowedRedirectUris.includes(logoutUri)) {
        throw new BadRequestException('Invalid logout_uri for this client')
      }
    }

    // Build frontend logout URL with parameters
    const frontendUrl = process.env.OAUTH_FRONTEND_URL || 'https://konto.bratislava.sk'
    const frontendLogoutUrl = new URL(`${frontendUrl}/odhlasenie`)

    // Add oauth_logout parameter so frontend knows to handle OAuth logout
    frontendLogoutUrl.searchParams.set('oauth_logout', 'true')

    if (logoutUri) {
      frontendLogoutUrl.searchParams.set('logout_uri', logoutUri)
    }
    if (state) {
      frontendLogoutUrl.searchParams.set('state', state)
    }

    res.redirect(frontendLogoutUrl.toString())
  }
}
