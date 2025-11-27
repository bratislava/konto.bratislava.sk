import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { CLIENT_NAME_KEY } from '../decorators/client-name.decorator'
import { OAuth2ClientSubservice, OAuth2Client } from '../subservices/oauth2-client.subservice'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum, ErrorsResponseEnum } from '../../utils/guards/dtos/error.dto'
import { CognitoGetUserData, CognitoAccessTokenDto } from '../../utils/global-dtos/cognito.dto'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { CognitoSubservice } from '../../utils/subservices/cognito.subservice'

interface RequestWithOAuth2Client extends Request {
  oauth2Client?: OAuth2Client
}

/**
 * Guard that validates OAuth2 access tokens using Passport
 * Extends AuthGuard to use the EncryptedJwtStrategy
 * Additionally validates that the token audience matches the client ID from decorator
 */
@Injectable()
export class OAuth2AccessGuard extends AuthGuard('encrypted-jwt-strategy') {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly reflector: Reflector,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly oAuth2ClientSubservice: OAuth2ClientSubservice,
    private readonly cognitoSubservice: CognitoSubservice
  ) {
    super()
    this.logger = new LineLoggerSubservice(OAuth2AccessGuard.name)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithOAuth2Client>()

    // Get client name from decorator (enum value)
    const clientName = this.reflector.getAllAndOverride<string>(CLIENT_NAME_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) as string

    if (!clientName) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Client name not specified. Use @ClientName() decorator on the endpoint.'
      )
    }

    // Look up client configuration by name to get the client ID
    const client = this.oAuth2ClientSubservice.findClientByName(clientName)
    if (!client) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `Client configuration not found for client name: ${clientName}`
      )
    }

    // Store client in request for use in handleRequest
    request.oauth2Client = client

    // Call parent AuthGuard to validate JWT (decryption and verification)
    // User data will be fetched in handleRequest after audience validation
    return !!(await super.canActivate(context))
  }

  // @ts-expect-error - handleRequest can be async at runtime even though interface doesn't reflect it
  async handleRequest<TUser = CognitoGetUserData>(
    error: Error | null,
    token: CognitoAccessTokenDto | null,
    info: { message?: string } | null,
    context: ExecutionContext
  ): Promise<TUser> {
    // Handle errors from Passport
    if (error) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `Failed to decrypt or verify token. Info: ${info?.message}`,
        error
      )
    }

    if (!token) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `Decoded token not found in request. Info: ${info?.message}`
      )
    }

    // Get client from request (set in canActivate)
    const request = context.switchToHttp().getRequest<RequestWithOAuth2Client>()
    const client = request.oauth2Client

    if (!client) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Client configuration not found in request context'
      )
    }

    // Validate audience matches client ID before fetching user data
    const tokenAudience = token.aud || token.client_id
    if (tokenAudience !== client.id) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `Token audience does not match client ID. Expected for ${client.name}: ${client.id}, Got: ${tokenAudience}`
      )
    }

    // Fetch user data from Cognito after audience validation
    const user = await this.cognitoSubservice.getDataFromCognito(token.sub)
    if (!user) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `User ${token.sub} not found in Cognito`
      )
    }
    return user as TUser
  }
}
