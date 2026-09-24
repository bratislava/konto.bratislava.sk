import { ErrorEnum, ErrorFactoryService, ErrorResponseEnum } from '@bratislava/log-nest'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'

import { decryptData } from '../../utils/crypto'
import { CognitoGetUserData } from '../../utils/global-dtos/cognito.dto'
import { deserializeTokenData } from '../../utils/tokenSerialization'
import { CLIENT_NAME_KEY } from '../decorators/client-name.decorator'
import { OAuth2ClientSubservice } from '../subservices/oauth2-client.subservice'

/**
 * Guard that validates OAuth2 access tokens using Passport
 * Decrypts the encrypted token, extracts clientId, and uses the regular Cognito strategy for JWT validation
 * Additionally validates that the token clientId matches the expected client ID from decorator
 */
@Injectable()
export class OAuth2AccessGuard extends AuthGuard('cognito-strategy') {
  constructor(
    private readonly reflector: Reflector,
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly oAuth2ClientSubservice: OAuth2ClientSubservice
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()

    // Get client name from decorator (enum value)
    const clientName = this.reflector.getAllAndOverride<string>(CLIENT_NAME_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!clientName) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: 'Client name not specified. Use @ClientName() decorator on the endpoint.',
      })
    }

    // Look up client configuration by name to get the client ID
    const client = this.oAuth2ClientSubservice.findClientByName(clientName)
    if (!client) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: `Client configuration not found for client name: ${clientName}`,
      })
    }

    // Decrypt the token and replace Authorization header before Passport processes it
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: 'Missing or invalid Authorization header',
      })
    }

    const encryptedToken = authHeader.substring(7)
    let tokenClientId: string | undefined
    try {
      const { token, clientId } = deserializeTokenData(decryptData(encryptedToken))
      tokenClientId = clientId
      // Replace Authorization header with the decrypted plain JWT
      request.headers.authorization = `Bearer ${token}`
    } catch (error) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: 'Failed to decrypt or deserialize token',
        error: error instanceof Error ? error : undefined,
      })
    }

    // Validate tokenClientId matches expected client ID
    if (tokenClientId !== client.id) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: `Token client ID does not match expected client ID. Expected for ${client.name}: ${client.id}, Got: ${tokenClientId}`,
      })
    }

    // Call parent AuthGuard to validate JWT using cognito-strategy
    return !!(await super.canActivate(context))
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- TUser must stay to match the IAuthGuard.handleRequest<TUser> override signature
  handleRequest<TUser = CognitoGetUserData>(
    error: Error | null,
    user: CognitoGetUserData | null,
    info: { message?: string } | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: ExecutionContext
  ): TUser {
    // Handle errors from Passport
    if (error) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: `Failed to verify token. Info: ${info?.message}`,
        error,
      })
    }

    if (!user) {
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: ErrorResponseEnum.UNAUTHORIZED_ERROR,
        console: `User not found. Info: ${info?.message}`,
      })
    }

    // User data already fetched by cognito-strategy
    return user as TUser
  }
}
