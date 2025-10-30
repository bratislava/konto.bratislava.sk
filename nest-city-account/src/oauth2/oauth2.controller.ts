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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthorizationRequestGuard } from './guards/authorization-request.guard'
import { TokenRequestGuard } from './guards/token-request.guard'
import { TokenRequestValidationPipe } from './pipes/token-request-validation.pipe'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  AuthorizationRequestDto,
  ContinueRequestDto,
  RefreshTokenRequestDto,
  StoreTokensRequestDto,
  TokenRequestDto,
} from './dtos/requests.oauth2.dto'

import {
  AuthorizationPayloadGuard,
  RequestWithAuthorizationPayload,
} from './guards/authorization-payload.guard'
import { TokenResponseDto } from './dtos/responses.oautuh2.dto'
import { OAuth2Service } from './oauth2.service'
import { OAuth2ExceptionFilter } from '../utils/filters/oauth2.filter'
import { HttpsGuard } from '../utils/guards/https.guard'
import { OAuth2AuthorizationErrorCode } from './oauth2.error.enum'

@ApiTags('OAuth2')
@Controller('oauth2')
@UseGuards(HttpsGuard)
@UseFilters(OAuth2ExceptionFilter)
export class OAuth2Controller {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(OAuth2Controller.name)

  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly throwerErrorGuard: ThrowerErrorGuard
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
  async authorize(@Query() query: AuthorizationRequestDto, @Res() res: Response): Promise<void> {
    this.logger.debug(`Authorization request received for client_id: ${query.client_id}`)

    // Service stores parameters and returns authorization request ID
    const authRequestId = await this.oauth2Service.storeAuthorizationRequest(query)

    // Controller builds redirect URL using service builder function
    // Includes redirect_uri and state for frontend error handling (frontend may send them back, but they're already stored in DB)
    const loginUrl = this.oauth2Service.buildLoginRedirectUrl(query, authRequestId)
    res.redirect(303, loginUrl)
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
      hasTokens: !!(body.access_token && body.refresh_token),
    })

    // Service stores tokens for the authorization request ID
    await this.oauth2Service.storeTokensForAuthRequest(
      body.payload,
      body.access_token,
      body.id_token,
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
      throw this.throwerErrorGuard.OAuth2AuthorizationException(
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

    res.redirect(303, redirectUrl)
  }

  @Post('token')
  @UsePipes(TokenRequestValidationPipe)
  @UseGuards(TokenRequestGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth2 Token Endpoint',
    description:
      'Exchange authorization code for tokens or refresh access token. Returns JSON response per RFC 6749 Section 5.1.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token exchange successful',
    type: TokenResponseDto,
  })
  async token(@Body() body: TokenRequestDto | RefreshTokenRequestDto): Promise<TokenResponseDto> {
    this.logger.debug(`Token request received for grant_type: ${body.grant_type}`)

    return this.oauth2Service.token(body)
  }
}
