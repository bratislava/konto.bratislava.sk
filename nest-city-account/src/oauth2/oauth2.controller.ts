import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ClientAuthGuard } from './guards/client-auth.guard'
import { ClientIdGuard } from './guards/client-id.guard'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  AuthorizationRequestDto,
  ContinueRequestDto,
  RefreshTokenRequestDto,
  TokenRequestDto,
} from './dtos/requests.oauth2.dto'
import {
  AuthorizationErrorResponseDto,
  AuthorizationResponseDto,
  ContinueResponseDto,
  TokenErrorResponseDto,
  TokenResponseDto,
} from './dtos/responses.oautuh2.dto'
import { ContinuePayloadGuard, RequestWithContinuePayload } from './guards/continue-payload.guard'
import { OAuth2Service } from './oauth2.service'

@ApiTags('OAuth2')
@Controller('oauth2')
export class OAuth2Controller {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(OAuth2Controller.name)

  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  // FIXME set the OK response status to be 303 See Other (or 302 Found, check https://datatracker.ietf.org/doc/html/rfc9700#name-307-redirect)
  // FIXME force TLS use, if feasible (check if it is enough to set on the network/ingress side or anything else is needed here)
  @Get('authorize')
  @UseGuards(ClientIdGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth2 Authorization Endpoint',
    description: 'Initiate OAuth2 authorization flow with PKCE (RFC 7636)',
  })
  @ApiOkResponse({
    description: 'Authorization successful, returns authorization code',
    type: AuthorizationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid authorization request',
    type: AuthorizationErrorResponseDto,
  })
  async authorize(
    @Query() query: AuthorizationRequestDto,
  ): Promise<AuthorizationResponseDto> {
    this.logger.debug(`Authorization request received for client_id: ${query.client_id}`)

    return await this.oauth2Service.authorize(query)
  }

  @Post('token')
  @UseGuards(ClientAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth2 Token Endpoint',
    description: 'Exchange authorization code for tokens or refresh access token',
  })
  @ApiOkResponse({
    description: 'Token exchange successful',
    type: TokenResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid token request',
    type: TokenErrorResponseDto,
  })
  async token(
    @Body() body: TokenRequestDto | RefreshTokenRequestDto,
  ): Promise<TokenResponseDto> {
    this.logger.debug(`Token request received for grant_type: ${body.grant_type}`)

    if (body.grant_type === 'authorization_code') {
      return await this.oauth2Service.exchangeCode(body as TokenRequestDto)
    } else if (body.grant_type === 'refresh_token') {
      return await this.oauth2Service.refreshToken(body as RefreshTokenRequestDto)
    }

    throw this.throwerErrorGuard.BadRequestException(
      ErrorsEnum.BAD_REQUEST_ERROR,
      `Unsupported grant_type: ${body.grant_type}`
    )
  }

  @Post('continue')
  @UseGuards(ContinuePayloadGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth2 Continue Endpoint',
    description: 'Continue authorization flow after user authentication. Called by frontend with tokens and original authorize request payload.',
  })
  @ApiOkResponse({
    description: 'Authorization flow continued, returns authorization code and redirect URI',
    type: ContinueResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid continue request',
    type: AuthorizationErrorResponseDto,
  })
  async continue(
    @Body() body: ContinueRequestDto,
    @Req() req: Request,
  ): Promise<ContinueResponseDto> {
    const request = req as RequestWithContinuePayload
    const authorizationRequest = request.continuePayload!

    this.logger.debug('Continue request received', {
      client_id: authorizationRequest.client_id,
      hasTokens: !!(body.access_token && body.id_token),
    })

    // Continue the authorization flow
    const authorizationResponse = await this.oauth2Service.continueAuthorization(
      authorizationRequest,
      body.access_token,
      body.id_token,
      body.refresh_token
    )

    // Return response with redirect URI
    return {
      code: authorizationResponse.code,
      state: authorizationResponse.state,
      redirect_uri: authorizationRequest.redirect_uri,
    }
  }
}
