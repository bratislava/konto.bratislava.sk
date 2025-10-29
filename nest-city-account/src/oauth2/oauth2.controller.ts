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
  UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import {
  ApiBadRequestResponse,
  ApiOperation, ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { AuthorizationRequestGuard } from './guards/authorization-request.guard'
import { TokenRequestGuard } from './guards/token-request.guard'
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
  AuthorizationErrorResponseDto, TokenErrorResponseDto,
  TokenResponseDto
} from './dtos/responses.oautuh2.dto'
import { AuthorizationContinueGuard, RequestWithAuthorizationContinue } from './guards/authorization-continue.guard'
import { OAuth2Service } from './oauth2.service'

@ApiTags('OAuth2')
@Controller('oauth2')
export class OAuth2Controller {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(OAuth2Controller.name)

  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  // FIXME force TLS use, if feasible (check if it is enough to set on the network/ingress side or anything else is needed here)
  @Get('authorize')
  @UseGuards(AuthorizationRequestGuard)
  @ApiOperation({
    summary: 'OAuth2 Authorization Endpoint',
    description: 'Initiate OAuth2 authorization flow with PKCE (RFC 7636). Redirects to frontend for user authentication (HTTP 303 See Other).',
  })
  @ApiResponse({
    status: 303,
    description: 'Redirects to frontend for user authentication',
  })
  @ApiBadRequestResponse({
    description: 'Invalid authorization request',
    type: AuthorizationErrorResponseDto,
  })
  async authorize(
    @Query() query: AuthorizationRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(`Authorization request received for client_id: ${query.client_id}`)

    // Service stores parameters and returns payload UUID
    const payloadUuid = await this.oauth2Service.authorize(query)

    // Controller builds redirect URL using service builder function
    // Includes redirect_uri and state for frontend error handling (frontend may send them back, but they're already stored in DB)
    const loginUrl = this.oauth2Service.buildLoginRedirectUrl(query, payloadUuid)
    res.redirect(303, loginUrl)
  }

  @Post('token')
  @UseGuards(TokenRequestGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth2 Token Endpoint',
    description: 'Exchange authorization code for tokens or refresh access token. Returns JSON response per RFC 6749 Section 5.1.',
  })
  @ApiResponse({
    status: 200,
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

    try {
      // RFC 6749 Section 5.1: Token endpoint must return JSON response, not redirect
      // The response is sent as JSON in the response body with application/json content type
      return await this.oauth2Service.token(body)
    } catch (error) {
      // Handle unsupported grant_type errors from service
      if (error instanceof Error && error.message.startsWith('Unsupported grant_type:')) {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          error.message
        )
      }
      throw error
    }
  }

  @Post('continue')
  @UseGuards(AuthorizationContinueGuard)
  @ApiOperation({
    summary: 'OAuth2 Continue Endpoint',
    description: 'Continue authorization flow after user authentication. Called by frontend with tokens and payload UUID. The server handles the redirect to the client redirect_uri with authorization code (HTTP 303 See Other).',
  })
  @ApiResponse({
    status: 303,
    description: 'Successfully redirects to client redirect_uri with authorization code and state (if provided)',
  })
  @ApiBadRequestResponse({
    description: 'Invalid continue request',
    type: AuthorizationErrorResponseDto,
  })
  async continue(
    @Body() body: ContinueRequestDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const request = req as RequestWithAuthorizationContinue
    const authorizationRequest = request.continuePayload!

    this.logger.debug('Continue request received', {
      client_id: authorizationRequest.client_id,
      hasTokens: !!(body.access_token && body.refresh_token),
    })

    // Service generates authorization code and returns response DTO
    const authResponse = await this.oauth2Service.continueAuthorization(
      authorizationRequest,
      body.access_token,
      body.id_token,
      body.refresh_token,
    )

    // Controller builds redirect URL using service builder function
    const redirectUrl = this.oauth2Service.buildAuthorizationResponseRedirectUrl(
      authorizationRequest.redirect_uri,
      authResponse
    )

    res.redirect(303, redirectUrl)
  }
}
