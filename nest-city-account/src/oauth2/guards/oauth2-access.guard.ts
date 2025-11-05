import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'
import { decryptData } from '../../utils/crypto'
import { CLIENT_NAME_KEY } from '../decorators/client-name.decorator'
import { OAuth2ClientSubservice } from '../subservices/oauth2-client.subservice'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum, ErrorsResponseEnum } from '../../utils/guards/dtos/error.dto'
import { CognitoGetUserData, CognitoAccessTokenDto } from '../../utils/global-dtos/cognito.dto'

/**
 * Guard that validates OAuth2 access tokens using Passport
 * Extends AuthGuard to use the EncryptedJwtStrategy
 * Additionally validates that the token audience matches the client ID from decorator
 */
@Injectable()
export class OAuth2AccessGuard extends AuthGuard('encrypted-jwt-strategy') {
  constructor(
    private readonly reflector: Reflector,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
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

    // Validate audience before fetching user data
    // Decode (without verification) the JWT to get the payload for audience check
    let tokenAudience: string | undefined

    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const encryptedToken = authHeader.substring(7)
      try {
        const decryptedToken = decryptData(encryptedToken)
        const decoded = jwt.decode(decryptedToken) as CognitoAccessTokenDto | null

        if (decoded) {
          // Validate audience matches client ID
          tokenAudience = decoded.aud || decoded.client_id
        }
      } catch (error) {
        // If decryption/decoding fails, the tokenAudience will stay undefined
      }
    }

    if (tokenAudience !== client.clientId) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        `Token audience does not match client ID. Expected for ${client.clientName}: ${client.clientId}, Got: ${tokenAudience}`
      )
    }

    // Call parent AuthGuard to validate JWT (decryption, verification, and fetch user data)
    return !!(await super.canActivate(context))
  }

  handleRequest<TUser = CognitoGetUserData>(
    error: Error | null,
    user: CognitoGetUserData | false,
    info: { message?: string } | null
  ): TUser {
    // Handle errors from Passport
    if (error) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        'Failed to decrypt or verify token',
        error
      )
    }

    if (!user) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
        info?.message || 'Authentication failed'
      )
    }

    return user as TUser
  }
}
