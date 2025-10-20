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
import {
  AuthorizeRequestDto,
  TokenRequestDto,
  TokenResponseDto,
  UserInfoResponseDto,
  OAuthErrorDto,
  OpenIdConfigurationDto,
} from './dtos/oauth.dto'

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Authorization endpoint - initiates OAuth flow
   * Proxies to Cognito's authorize endpoint
   */
  @Get('authorize')
  @UseGuards(PartnerAuthGuard)
  @ApiOperation({
    summary: 'OAuth Authorization Endpoint',
    description:
      'Initiates the OAuth 2.0 authorization code flow. Redirects to Cognito for authentication.',
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
    description: 'Redirects to Cognito authorization page',
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

    const authorizeUrl = this.oauthService.buildAuthorizeUrl(authorizeDto, req.partner)
    res.redirect(authorizeUrl)
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

    // Validate client secret is provided (either in header or body)
    if (!req.clientSecret && !tokenDto.client_secret) {
      throw new UnauthorizedException('Client secret is required')
    }

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
   * Note: Cognito supports token revocation
   */
  @Post('revoke')
  @HttpCode(200)
  @UseGuards(PartnerAuthGuard)
  @ApiOperation({
    summary: 'OAuth Token Revocation Endpoint',
    description: 'Revokes an access token or refresh token.',
  })
  @ApiBasicAuth('client_credentials')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'The token to revoke' },
        token_type_hint: {
          type: 'string',
          enum: ['access_token', 'refresh_token'],
          description: 'Hint about the type of token being revoked',
        },
      },
      required: ['token'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token successfully revoked',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid client credentials',
    type: OAuthErrorDto,
  })
  async revoke(
    @Body('token') token: string,
    @Body('token_type_hint') tokenTypeHint: string,
    @Req() req: RequestWithPartner
  ): Promise<{ message: string }> {
    if (!req.partner) {
      throw new UnauthorizedException('Invalid partner')
    }

    if (!token) {
      throw new UnauthorizedException('Token is required')
    }

    // Note: You'll need to implement token revocation with Cognito
    // Cognito supports this via the RevokeToken API
    // For now, returning a success response
    return { message: 'Token revocation endpoint - to be implemented with Cognito RevokeToken API' }
  }
}
