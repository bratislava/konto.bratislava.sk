import { Provider, UnauthorizedException } from '@nestjs/common'

import { CityAccountUserService } from '../../../src/auth-v2/services/city-account-user.service'
import { CognitoGuestIdentityService } from '../../../src/auth-v2/services/cognito-guest-identity.service'
import { CognitoJwtVerifyService } from '../../../src/auth-v2/services/cognito-jwt-verify.service'
import { CognitoUserService } from '../../../src/auth-v2/services/cognito-user.service'
import { AuthUser } from '../../../src/auth-v2/types/user'
import {
  fixtureAuthUser,
  fixtureAuthUserBearerToken,
  fixtureAuthUserSub,
  fixtureGuestUserIdentityId,
} from '../../fixtures/auth/user'

const CognitoJwtVerifyServiceMock = {
  verify: async (bearerToken: string) => {
    if (bearerToken === fixtureAuthUserBearerToken) {
      return (fixtureAuthUser.user as AuthUser).cognitoJwtPayload
    }

    throw new UnauthorizedException(
      'Invalid bearer token provided to CognitoJwtVerifyServiceMock.verify',
    )
  },
} as CognitoJwtVerifyService

const CognitoAttributesServiceMock = {
  getUserAttributes: async (sub: string) => {
    if (sub === fixtureAuthUserSub) {
      return (fixtureAuthUser.user as AuthUser).cognitoUser
    }

    throw new UnauthorizedException(
      'Invalid sub provided to CognitoAttributesServiceMock.getUserAttributes',
    )
  },
} as CognitoUserService

const CityAccountUserServiceMock = {
  getUser: async (bearerToken: string) => {
    if (bearerToken === fixtureAuthUserBearerToken) {
      return (fixtureAuthUser.user as AuthUser).cityAccountUser
    }

    throw new UnauthorizedException(
      'Invalid bearer token provided to CityAccountUserServiceMock.getUser',
    )
  },
} as CityAccountUserService

const CognitoGuestIdentityServiceMock = {
  async verifyGuestIdentityId(guestIdentityId: string): Promise<boolean> {
    return guestIdentityId === fixtureGuestUserIdentityId
  },
} as CognitoGuestIdentityService

export const mockAuthProviders: Provider[] = [
  {
    provide: CognitoJwtVerifyService,
    useValue: CognitoJwtVerifyServiceMock,
  },
  {
    provide: CognitoUserService,
    useValue: CognitoAttributesServiceMock,
  },
  {
    provide: CityAccountUserService,
    useValue: CityAccountUserServiceMock,
  },
  {
    provide: CognitoGuestIdentityService,
    useValue: CognitoGuestIdentityServiceMock,
  },
]
