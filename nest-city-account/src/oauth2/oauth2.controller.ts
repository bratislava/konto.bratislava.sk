import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import { Request, Response } from 'express'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'
import { AuthorizationRequestGuard } from './guards/authorization-request.guard'
import { TokenRequestGuard, RequestWithClientCredentials } from './guards/token-request.guard'
import { TokenRequestValidationPipe } from './pipes/token-request-validation.pipe'
import { OAuth2ErrorThrower } from './oauth2-error.thrower'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  AuthorizationRequestDto,
  ClientInfoRequestDto,
  ContinueRequestDto,
  RefreshTokenRequestDto,
  StoreTokensRequestDto,
  TokenRequestDto,
  TokenRequestUnion,
} from './dtos/requests.oauth2.dto'

import {
  AuthorizationPayloadGuard,
  RequestWithAuthorizationPayload,
} from './guards/authorization-payload.guard'
import { ClientInfoResponseDto, TokenResponseDto } from './dtos/responses.oauth2.dto'
import { OAuth2Service } from './oauth2.service'
import { OAuth2ExceptionFilter } from './filters/oauth2-exception.filter'
import { HttpsGuard } from '../utils/guards/https.guard'
import { OAuth2AuthorizationErrorCode } from './oauth2.error.enum'
import { OAuth2AuthorizationErrorDto, OAuth2TokenErrorDto } from './dtos/errors.oauth2.dto'

@ApiTags('OAuth2')
@Controller('oauth2')
@UseGuards(HttpsGuard)
@UseFilters(OAuth2ExceptionFilter)
export class OAuth2Controller {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(OAuth2Controller.name)

  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly oAuth2ErrorThrower: OAuth2ErrorThrower
  ) {}

  @Get('authorize')
  @UseGuards(AuthorizationRequestGuard)
  @ApiOperation({
    summary: 'OAuth2 Authorization Endpoint',
    description:
      'Initiate OAuth2 authorization flow with PKCE (RFC 7636). Redirects to frontend for user authentication (HTTP 303 See Other).',
  })
  @ApiResponse({
    status: 303,
    description: 'Redirects to frontend for user authentication',
  })
  @ApiResponse({
    status: 303,
    description:
      'Redirects to client redirect_uri with OAuth2 error parameters (error, error_description, error_uri, state) if authorization fails with valid redirect_uri (RFC 6749 Section 4.1.2.1)',
  })
  @ApiResponse({
    status: 400,
    description:
      'Returns OAuth2 error as JSON if authorization fails without valid redirect_uri to prevent open redirector vulnerability (RFC 6749 Section 4.1.2.1)',
    type: OAuth2AuthorizationErrorDto,
  })
  async authorize(@Query() query: AuthorizationRequestDto, @Res() res: Response): Promise<void> {
    this.logger.debug(`Authorization request received for client_id: ${query.client_id}`)

    // Service stores parameters and returns authorization request ID
    const authRequestId = await this.oauth2Service.storeAuthorizationRequest(query)

    // Controller builds redirect URL using service builder function
    // Includes redirect_uri and state for frontend error handling (frontend may send them back, but they're already stored in DB)
    const loginUrl = this.oauth2Service.buildLoginRedirectUrl(query, authRequestId)

    // RFC 9700: Use 303 See Other for OAuth2 redirects
    res.redirect(HttpStatus.SEE_OTHER, loginUrl)
  }

  @Post('store')
  @UseGuards(AuthorizationPayloadGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth2 Store Tokens Endpoint',
    description:
      'Store tokens after user authentication. Called by frontend with tokens and authorization request ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully stored',
  })
  async storeTokens(@Body() body: StoreTokensRequestDto, @Req() req: Request): Promise<void> {
    const request = req as RequestWithAuthorizationPayload
    const authorizationRequest = request.authorizationPayload!

    this.logger.debug('Store tokens request received', {
      client_id: authorizationRequest.client_id,
      payload: body.payload,
      hasRefreshToken: !!body.refresh_token,
    })

    // Service stores tokens for the authorization request ID
    await this.oauth2Service.storeTokensForAuthRequest(
      body.payload,
      authorizationRequest.client_id,
      body.refresh_token
    )
  }

  @Get('continue')
  @UseGuards(AuthorizationPayloadGuard)
  @ApiOperation({
    summary: 'OAuth2 Continue Endpoint',
    description:
      'Complete authorization flow after tokens are stored via POST /oauth2/store. Called by frontend with authorization request ID. Checks if tokens are stored, generates authorization grant, and redirects to client redirect_uri with authorization code (HTTP 303 See Other).',
  })
  @ApiResponse({
    status: 303,
    description:
      'Successfully redirects to client redirect_uri with authorization code and state (if provided)',
  })
  async continueComplete(
    @Query() query: ContinueRequestDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const request = req as RequestWithAuthorizationPayload
    const authorizationRequest = request.authorizationPayload!

    this.logger.debug('Continue complete request received', {
      client_id: authorizationRequest.client_id,
      payload: query.payload,
    })

    // Check if tokens are stored
    const tokensStored = await this.oauth2Service.areTokensStoredForAuthRequest(query.payload)
    if (!tokensStored) {
      throw this.oAuth2ErrorThrower.authorizationException(
        OAuth2AuthorizationErrorCode.SERVER_ERROR,
        'Authorization server error: unable to provide tokens for this authorization request'
      )
    }

    // Service generates authorization code and returns response DTO
    const authResponse = await this.oauth2Service.continueAuthorization(
      query.payload,
      authorizationRequest
    )

    // Controller builds redirect URL using service builder function
    const redirectUrl = this.oauth2Service.buildAuthorizationResponseRedirectUrl(
      authorizationRequest.redirect_uri,
      authResponse
    )

    // RFC 9700: Use 303 See Other for OAuth2 redirects
    res.redirect(HttpStatus.SEE_OTHER, redirectUrl)
  }

  @Post('token')
  @ApiExtraModels(TokenRequestDto, RefreshTokenRequestDto)
  @UsePipes(TokenRequestValidationPipe)
  @UseGuards(TokenRequestGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth2 Token Endpoint',
    description:
      'Exchange authorization code for tokens or refresh access token. Returns JSON response per RFC 6749 Section 5.1.',
  })
  @ApiBody({
    description: 'Token request - use authorization_code or refresh_token grant type',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(TokenRequestDto) },
        { $ref: getSchemaPath(RefreshTokenRequestDto) },
      ],
      discriminator: {
        propertyName: 'grant_type',
        mapping: {
          authorization_code: getSchemaPath(TokenRequestDto),
          refresh_token: getSchemaPath(RefreshTokenRequestDto),
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token exchange successful',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Token request failed with OAuth2 error (RFC 6749 Section 5.2). Always returns HTTP 400 Bad Request with error details in JSON body',
    type: OAuth2TokenErrorDto,
  })
  async token(@Body() body: TokenRequestUnion, @Req() req: Request): Promise<TokenResponseDto> {
    this.logger.debug(`Token request received for grant_type: ${body.grant_type}`)

    // Normalize client credentials: extract from validated credentials in request (set by TokenRequestGuard)
    const request = req as RequestWithClientCredentials
    if (request.tokenClientId && request.oauth2ClientSecret) {
      body.client_id = request.tokenClientId
      body.client_secret = request.oauth2ClientSecret
    }

    return this.oauth2Service.token(body)
  }

  @Get('info')
  @UseGuards(AuthorizationPayloadGuard)
  @ApiOperation({
    summary: 'OAuth2 Client Info Endpoint',
    description: 'Get client information (client id and client name) by authorization request id.',
  })
  @ApiResponse({
    status: 200,
    description: 'Client information retrieved successfully',
    type: ClientInfoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or client not found',
    type: OAuth2AuthorizationErrorDto,
  })
  async info(
    @Query() query: ClientInfoRequestDto,
    @Req() req: Request
  ): Promise<ClientInfoResponseDto> {
    const request = req as RequestWithAuthorizationPayload
    const authorizationRequest = request.authorizationPayload!

    this.logger.debug('Info request received', {
      client_id: authorizationRequest.client_id,
      payload: query.payload,
    })

    return this.oauth2Service.getClientInfo(authorizationRequest.client_id)
  }
}
