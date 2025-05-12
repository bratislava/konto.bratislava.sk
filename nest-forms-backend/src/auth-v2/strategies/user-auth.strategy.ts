import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy as CustomStrategy } from 'passport-custom'

import { CityAccountUserService } from '../services/city-account-user.service'
import { CognitoAttributesService } from '../services/cognito-attributes.service'
import { CognitoGuestIdentityService } from '../services/cognito-guest-identity.service'
import { CognitoJwtVerifyService } from '../services/cognito-jwt-verify.service'
import { AuthUser, GuestUser, User, UserType } from '../types/user'
import { extractBearerFromRequest } from '../utils/extract-bearer-from-request'
import { extractCognitoGuestIdentityIdFromRequest } from '../utils/extract-cognito-guest-identity-id-from-request'

@Injectable()
export class UserAuthStrategy extends PassportStrategy(
  CustomStrategy,
  'user-auth',
) {
  private readonly logger = new Logger(UserAuthStrategy.name)

  constructor(
    private readonly cognitoJwtVerifyService: CognitoJwtVerifyService,
    private readonly cognitoAttributesService: CognitoAttributesService,
    private readonly cityAccountUserService: CityAccountUserService,
    private readonly cognitoGuestIdentityService: CognitoGuestIdentityService,
  ) {
    super()
  }

  async validate(req: Request): Promise<User> {
    const bearerToken = extractBearerFromRequest(req)
    const guestIdentityId = extractCognitoGuestIdentityIdFromRequest(req)

    console.log(bearerToken, guestIdentityId)

    if (bearerToken && guestIdentityId) {
      throw new UnauthorizedException('Invalid request')
    }

    if (bearerToken) {
      try {
        this.logger.debug('Attempting authentication via Bearer token.')
        const cognitoPayload =
          await this.cognitoJwtVerifyService.verify(bearerToken)
        console.log('cognito payload', cognitoPayload)
        const cognitoAttributes =
          await this.cognitoAttributesService.getUserAttributes(
            cognitoPayload.sub,
          )
        // Pass the original bearer token to the service
        const cityAccountUser =
          await this.cityAccountUserService.getUser(bearerToken)

        const authUser: AuthUser = {
          type: UserType.Auth,
          cognitoPayload,
          cognitoAttributes,
          cityAccountUser,
        }
        this.logger.log(`Authenticated user: ${cognitoPayload.username}`)
        return authUser // Return authenticated user
      } catch (error: any) {
        this.logger.warn(`Bearer token authentication failed: ${error.message}`)
        // If auth fails, we might still proceed if a guest ID is present
      }
    }

    // Attempt Guest User Identification if guest ID exists
    if (guestIdentityId) {
      try {
        this.logger.debug('Attempting identification via Cognito Guest ID.')
        const isValidGuest =
          await this.cognitoGuestIdentityService.verifyGuestIdentityId(
            guestIdentityId,
          )

        if (isValidGuest) {
          const guestUser: GuestUser = {
            type: UserType.Guest,
            cognitoIdentityId: guestIdentityId,
          }
          this.logger.log(`Identified guest user: ${guestIdentityId}`)
          return guestUser // Return guest user
        }
        // If the guest ID is present but invalid, treat as unauthorized
        this.logger.warn(
          `Invalid Cognito Guest Identity ID provided: ${guestIdentityId}`,
        )
        throw new UnauthorizedException('Invalid guest session identifier')
      } catch (error: any) {
        // Catch errors during guest verification (e.g., AWS SDK errors)
        this.logger.error(
          `Error verifying Cognito Guest Identity ID ${guestIdentityId}: ${error.message}`,
          error.stack,
        )
        throw new UnauthorizedException(
          'Could not verify guest session identifier',
        )
      }
    }

    // If neither Bearer token led to successful Auth, nor a valid Guest ID was found
    this.logger.warn(
      'No valid authentication credentials or guest identifier found.',
    )
    throw new UnauthorizedException('Authentication required')
  }
}
