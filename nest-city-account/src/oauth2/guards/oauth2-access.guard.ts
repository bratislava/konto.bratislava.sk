import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { CLIENT_NAME_KEY } from '../decorators/client-name.decorator'
import { OAuth2ClientSubservice } from '../subservices/oauth2-client.subservice'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum, ErrorsResponseEnum } from '../../utils/guards/dtos/error.dto'
import { CognitoGetUserData } from '../../utils/global-dtos/cognito.dto'
import { decryptData } from '../../utils/crypto'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { deserializeTokenData } from '../../utils/tokenSerialization'

/**
 * Guard that validates OAuth2 access tokens using Passport
 * Decrypts the encrypted token, extracts clientId, and uses the regular Cognito strategy for JWT validation
 * Additionally validates that the token clientId matches the expected client ID from decorator
 */
@Injectable()
export class OAuth2AccessGuard extends AuthGuard('cognito-strategy') {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly reflector: Reflector,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly oAuth2ClientSubservice: OAuth2ClientSubservice
  ) {
    super()
    this.logger = new LineLoggerSubservice(OAuth2AccessGuard.name)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()

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

    // Decrypt the token and replace Authorization header before Passport processes it
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Missing or invalid Authorization header'
      )
    }

    const encryptedToken = authHeader.substring(7)
    let tokenClientId: string | undefined = undefined
    try {
      const { token, clientId } = deserializeTokenData(decryptData(encryptedToken))
      tokenClientId = clientId
      // Replace Authorization header with the decrypted plain JWT
      request.headers.authorization = `Bearer ${token}`
    } catch (error) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Failed to decrypt or deserialize token',
        error instanceof Error ? error : undefined
      )
    }

    // Validate tokenClientId matches expected client ID
    if (tokenClientId !== client.id) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `Token client ID does not match expected client ID. Expected for ${client.name}: ${client.id}, Got: ${tokenClientId}`
      )
    }

    // Call parent AuthGuard to validate JWT using cognito-strategy
    return !!(await super.canActivate(context))
  }

  handleRequest<TUser = CognitoGetUserData>(
    error: Error | null,
    user: CognitoGetUserData | null,
    info: { message?: string } | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: ExecutionContext
  ): TUser {
    // Handle errors from Passport
    if (error) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `Failed to verify token. Info: ${info?.message}`,
        error
      )
    }

    if (!user) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `User not found. Info: ${info?.message}`
      )
    }

    // User data already fetched by cognito-strategy
    return user as TUser
  }
}
