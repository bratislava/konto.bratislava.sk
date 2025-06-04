import { TestingModuleBuilder } from '@nestjs/testing'
import jwt from 'jsonwebtoken'
import {
  UserOfficialCorrespondenceChannelEnum,
  UserVerifyStateCognitoTierEnum,
  UserVerifyStateTypeEnum,
} from 'openapi-clients/city-account'
import { v4 as uuidv4 } from 'uuid'

import { CityAccountUserService } from '../../../src/auth-v2/services/city-account-user.service'
import { CognitoGuestIdentityService } from '../../../src/auth-v2/services/cognito-guest-identity.service'
import { CognitoJwtVerifyService } from '../../../src/auth-v2/services/cognito-jwt-verify.service'
import { CognitoUserService } from '../../../src/auth-v2/services/cognito-user.service'
import { AuthUser, GuestUser, UserType } from '../../../src/auth-v2/types/user'

export type GuestFixtureUser = {
  identityId: string
  headers: {
    'X-Cognito-Guest-Identity-Id': string
  }
  user: GuestUser
}
export type AuthFixtureUser = {
  sub: string
  headers: {
    Authorization: string
  }
  user: AuthUser
}

export type FixtureUser = GuestFixtureUser | AuthFixtureUser

const getRandomGuestIdentityId = () => `eu-central-1:${uuidv4()}`

export class UserFixtureFactory {
  private readonly mockJwtSignSecret = 'secret'

  private authUsers: AuthFixtureUser[] = []

  private guestUsers: GuestFixtureUser[] = []

  createGuestUser(): GuestFixtureUser {
    const randomGuestIdentityId = getRandomGuestIdentityId()

    const user: GuestFixtureUser = {
      identityId: randomGuestIdentityId,
      headers: {
        'X-Cognito-Guest-Identity-Id': randomGuestIdentityId,
      },
      user: {
        type: UserType.Guest,
        cognitoIdentityId: randomGuestIdentityId,
      },
    }

    this.guestUsers.push(user)
    return user
  }

  createAuthUser({
    accountType = UserVerifyStateTypeEnum.Fo,
    tier = UserVerifyStateCognitoTierEnum.IdentityCard,
    givenName = 'John',
    familyName = 'Doe',
    email = 'user@example.com',
    ico = 'ico://sk/1234567890',
  }: {
    accountType?: UserVerifyStateTypeEnum
    tier?: UserVerifyStateCognitoTierEnum
    givenName?: string
    familyName?: string
    email?: string
    ico?: string
  } = {}): AuthFixtureUser {
    const randomSub = uuidv4()
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const cognitoPayloadRaw = {
      sub: randomSub,
      iss: 'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_GCBQzfACy',
      client_id: 'exampleClientId',
      origin_jti: uuidv4(),
      event_id: uuidv4(),
      token_use: 'access' as const,
      scope: 'aws.cognito.signin.user.admin',
      auth_time: nowInSeconds,
      username: randomSub,
    }
    const bearerToken = jwt.sign(cognitoPayloadRaw, this.mockJwtSignSecret, {
      jwtid: uuidv4(),
      expiresIn: '1h',
    })
    const decodedCognitoPayload = jwt.decode(bearerToken, {
      json: true,
    }) as {
      iat: number
      exp: number
      jti: string
    } & typeof cognitoPayloadRaw

    const getCityAccountUser = () => {
      const base = {
        id: uuidv4(),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        externalId: randomSub,
        email,
        birthNumber: null,
        gdprData: [],
      }
      if (accountType === UserVerifyStateTypeEnum.Fo) {
        return {
          ...base,
          wasVerifiedBeforeTaxDeadline: false,
          officialCorrespondenceChannel:
            UserOfficialCorrespondenceChannelEnum.Postal,
          showEmailCommunicationBanner: false,
        }
      }

      if (
        accountType === UserVerifyStateTypeEnum.FoP ||
        accountType === UserVerifyStateTypeEnum.Po
      ) {
        return {
          ...base,
          ico: ico ?? null,
        }
      }

      throw new Error('Invalid account type')
    }

    /* eslint-disable pii/no-email */
    const user: AuthFixtureUser = {
      sub: randomSub,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      user: {
        type: UserType.Auth,
        cognitoJwtPayload: {
          version: 1,
          ...decodedCognitoPayload,
        },
        cognitoUser: {
          userAttributes: {
            sub: randomSub,
            'custom:account_type': accountType,
            'custom:tier': tier,
            given_name: givenName,
            family_name: familyName,
            email,
          },
          userCreateDate: new Date('2024-01-01T00:00:00.000Z'),
          userLastModifiedDate: new Date('2024-01-02T00:00:00.000Z'),
          userStatus: 'CONFIRMED',
          username: randomSub,
        },
        cityAccountUser: getCityAccountUser(),
      },
    }
    /* eslint-enable pii/no-email */

    this.authUsers.push(user)
    return user
  }

  // Convenience methods for common scenarios
  createFoUser(overrides?: Partial<Parameters<typeof this.createAuthUser>[0]>) {
    return this.createAuthUser({
      accountType: UserVerifyStateTypeEnum.Fo,
      ...overrides,
    })
  }

  createPoUser(overrides?: Partial<Parameters<typeof this.createAuthUser>[0]>) {
    return this.createAuthUser({
      accountType: UserVerifyStateTypeEnum.Po,
      ...overrides,
    })
  }

  setupMockAuth(module: TestingModuleBuilder): TestingModuleBuilder {
    module
      .overrideProvider(CognitoJwtVerifyService)
      .useValue({
        verify: async (bearerToken: string) => {
          const userFixture = this.authUsers.find(
            (fixture) =>
              fixture.headers.Authorization === `Bearer ${bearerToken}`,
          )
          if (userFixture) return userFixture.user.cognitoJwtPayload
          throw new Error('Invalid bearer token')
        },
      } satisfies Partial<CognitoJwtVerifyService>)
      .overrideProvider(CognitoUserService)
      .useValue({
        getUserAttributes: async (sub: string) => {
          const userFixture = this.authUsers.find(
            (fixture) => fixture.sub === sub,
          )
          if (userFixture) return userFixture.user.cognitoUser
          throw new Error('Invalid sub')
        },
      } satisfies Partial<CognitoUserService>)
      .overrideProvider(CityAccountUserService)
      .useValue({
        getUser: async (bearerToken: string) => {
          const userFixture = this.authUsers.find(
            (fixture) =>
              fixture.headers.Authorization === `Bearer ${bearerToken}`,
          )
          if (userFixture) return userFixture.user.cityAccountUser
          throw new Error('Invalid bearer token')
        },
      } satisfies Partial<CityAccountUserService>)
      .overrideProvider(CognitoGuestIdentityService)
      .useValue({
        verifyGuestIdentityId: async (guestIdentityId: string) =>
          this.guestUsers.some(
            (fixture) =>
              fixture.headers['X-Cognito-Guest-Identity-Id'] ===
              guestIdentityId,
          ),
      } satisfies Partial<CognitoGuestIdentityService>)

    return module
  }
}
