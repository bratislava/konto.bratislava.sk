import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy as CustomStrategy } from 'passport-custom'

import { CityAccountUserService } from '../services/city-account-user.service'
import { CognitoGuestIdentityService } from '../services/cognito-guest-identity.service'
import { CognitoJwtVerifyService } from '../services/cognito-jwt-verify.service'
import { CognitoUserService } from '../services/cognito-user.service'
import { AuthUser, GuestUser, UserType } from '../types/user'
import { extractBearerFromRequest } from '../utils/extract-bearer-from-request'
import { extractCognitoGuestIdentityIdFromRequest } from '../utils/extract-cognito-guest-identity-id-from-request'

@Injectable()
export class UserAuthStrategy extends PassportStrategy(
  CustomStrategy,
  'user-auth',
) {
  constructor(
    private readonly cognitoJwtVerifyService: CognitoJwtVerifyService,
    private readonly cognitoUserService: CognitoUserService,
    private readonly cognitoGuestIdentityService: CognitoGuestIdentityService,
    private readonly cityAccountUserService: CityAccountUserService,
  ) {
    super()
  }

  private async authenticateWithBearerToken(bearerToken: string) {
    const cognitoJwtPayload =
      await this.cognitoJwtVerifyService.verify(bearerToken)
    const [cognitoAttributes, cityAccountUser] = await Promise.all([
      this.cognitoUserService.getUserAttributes(cognitoJwtPayload.sub),
      this.cityAccountUserService.getUser(bearerToken),
    ])

    return {
      type: UserType.Auth,
      cognitoJwtPayload,
      cognitoUser: cognitoAttributes,
      cityAccountUser,
    } as AuthUser
  }

  private async identifyWithGuestId(guestIdentityId: string) {
    const isValidGuest =
      await this.cognitoGuestIdentityService.verifyGuestIdentityId(
        guestIdentityId,
      )

    if (isValidGuest) {
      return {
        type: UserType.Guest,
        cognitoIdentityId: guestIdentityId,
      } as GuestUser
    }

    throw new UnauthorizedException('Invalid guest session identifier')
  }

  async validate(req: Request) {
    const bearerToken = extractBearerFromRequest(req)
    const guestIdentityId = extractCognitoGuestIdentityIdFromRequest(req)

    if (bearerToken && guestIdentityId) {
      throw new UnauthorizedException(
        'Invalid request: Cannot provide both Bearer token and Guest ID.',
      )
    }

    if (bearerToken) {
      return this.authenticateWithBearerToken(bearerToken)
    }

    if (guestIdentityId) {
      return this.identifyWithGuestId(guestIdentityId)
    }

    throw new UnauthorizedException('Authentication required')
  }
}
