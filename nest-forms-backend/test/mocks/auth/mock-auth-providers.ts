import { Provider, UnauthorizedException } from '@nestjs/common'

import { CityAccountUserService } from '../../../src/auth-v2/services/city-account-user.service'
import { CognitoGuestIdentityService } from '../../../src/auth-v2/services/cognito-guest-identity.service'
import { CognitoJwtVerifyService } from '../../../src/auth-v2/services/cognito-jwt-verify.service'
import { CognitoUserService } from '../../../src/auth-v2/services/cognito-user.service'
import { AuthFixtureUser, GuestFixtureUser } from '../../fixtures/auth/user'

export function createMockAuthProviders(
  authUsers: AuthFixtureUser[],
  guestUsers: GuestFixtureUser[],
): Provider[] {
  return [
    {
      provide: CognitoJwtVerifyService,
      useValue: {
        verify: async (bearerToken: string) => {
          const userFixture = authUsers.find(
            (fixture) =>
              fixture.headers.Authorization === `Bearer ${bearerToken}`,
          )
          if (userFixture) return userFixture.user.cognitoJwtPayload
          throw new UnauthorizedException('Invalid bearer token')
        },
      } as CognitoJwtVerifyService,
    },
    {
      provide: CognitoUserService,
      useValue: {
        getUserAttributes: async (sub: string) => {
          const userFixture = authUsers.find((fixture) => fixture.sub === sub)
          if (userFixture) return userFixture.user.cognitoUser
          throw new UnauthorizedException('Invalid sub')
        },
      } as CognitoUserService,
    },
    {
      provide: CityAccountUserService,
      useValue: {
        getUser: async (bearerToken: string) => {
          const userFixture = authUsers.find(
            (fixture) =>
              fixture.headers.Authorization === `Bearer ${bearerToken}`,
          )
          if (userFixture) return userFixture.user.cityAccountUser
          throw new UnauthorizedException('Invalid bearer token')
        },
      } as CityAccountUserService,
    },
    {
      provide: CognitoGuestIdentityService,
      useValue: {
        verifyGuestIdentityId: async (guestIdentityId: string) =>
          guestUsers.some(
            (fixture) =>
              fixture.headers['X-Cognito-Guest-Identity-Id'] ===
              guestIdentityId,
          ),
      } as CognitoGuestIdentityService,
    },
  ]
}
