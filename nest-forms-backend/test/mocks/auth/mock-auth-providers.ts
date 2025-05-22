import { Provider, UnauthorizedException } from '@nestjs/common'

import { CityAccountUserService } from '../../../src/auth-v2/services/city-account-user.service'
import { CognitoGuestIdentityService } from '../../../src/auth-v2/services/cognito-guest-identity.service'
import { CognitoJwtVerifyService } from '../../../src/auth-v2/services/cognito-jwt-verify.service'
import { CognitoUserService } from '../../../src/auth-v2/services/cognito-user.service'
import { fixtureAuthUsers, fixtureGuestUsers } from '../../fixtures/auth/user'

const CognitoJwtVerifyServiceMock = {
  verify: async (bearerToken: string) => {
    const userFixture = fixtureAuthUsers.find(
      (fixture) => fixture.headers.Authorization === `Bearer ${bearerToken}`,
    )

    if (userFixture) {
      return userFixture.user.cognitoJwtPayload
    }

    throw new UnauthorizedException(
      'Invalid bearer token provided to CognitoJwtVerifyServiceMock.verify',
    )
  },
} as CognitoJwtVerifyService

const CognitoUserServiceMock = {
  getUserAttributes: async (sub: string) => {
    const userFixture = fixtureAuthUsers.find((fixture) => fixture.sub === sub)

    if (userFixture) {
      return userFixture.user.cognitoUser
    }

    throw new UnauthorizedException(
      'Invalid sub provided to CognitoUserServiceMock.getUserAttributes',
    )
  },
} as CognitoUserService

const CityAccountUserServiceMock = {
  getUser: async (bearerToken: string) => {
    const userFixture = fixtureAuthUsers.find(
      (fixture) => fixture.headers.Authorization === `Bearer ${bearerToken}`,
    )

    if (userFixture) {
      return userFixture.user.cityAccountUser
    }

    throw new UnauthorizedException(
      'Invalid bearer token provided to CityAccountUserServiceMock.getUser',
    )
  },
} as CityAccountUserService

const CognitoGuestIdentityServiceMock = {
  async verifyGuestIdentityId(guestIdentityId: string) {
    const userFixture = fixtureGuestUsers.find(
      (fixture) =>
        fixture.headers['X-Cognito-Guest-Identity-Id'] === guestIdentityId,
    )

    return Boolean(userFixture)
  },
} as CognitoGuestIdentityService

export const mockAuthProviders: Provider[] = [
  {
    provide: CognitoJwtVerifyService,
    useValue: CognitoJwtVerifyServiceMock,
  },
  {
    provide: CognitoUserService,
    useValue: CognitoUserServiceMock,
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
