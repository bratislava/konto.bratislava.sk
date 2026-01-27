import { UnauthorizedException } from '@nestjs/common'
import { TestingModuleBuilder } from '@nestjs/testing'
import {
  randCompanyName,
  randEmail,
  randFirstName,
  randLastName,
} from '@ngneat/falso'
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

  private generatedIcos = new Set<string>()

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

  private createAuthUser(
    params:
      | {
          accountType: typeof UserVerifyStateTypeEnum.Fo
          tier?: UserVerifyStateCognitoTierEnum
        }
      | {
          accountType:
            | typeof UserVerifyStateTypeEnum.FoP
            | typeof UserVerifyStateTypeEnum.Po
          ico: string
          tier?: UserVerifyStateCognitoTierEnum
        },
  ): AuthFixtureUser {
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
    const email = randEmail()

    const getCityAccountUser = () => {
      const base = {
        id: uuidv4(),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        externalId: randomSub,
        email,
        birthNumber: null,
        gdprData: [],
        hasChangedDeliveryMethodAfterDeadline: false,
      }
      if (params.accountType === UserVerifyStateTypeEnum.Fo) {
        return {
          ...base,
          officialCorrespondenceChannel:
            UserOfficialCorrespondenceChannelEnum.Postal,
          showEmailCommunicationBanner: false,
        }
      }

      if (
        params.accountType === UserVerifyStateTypeEnum.FoP ||
        params.accountType === UserVerifyStateTypeEnum.Po
      ) {
        return {
          ...base,
          ico: params.ico,
        }
      }

      throw new Error('Invalid account type')
    }

    const getUserAttributes = () => {
      const base = {
        sub: randomSub,
        'custom:account_type': params.accountType,
        'custom:tier': params.tier ?? UserVerifyStateCognitoTierEnum.New,
        email,
      }
      if (params.accountType === UserVerifyStateTypeEnum.Fo) {
        const givenName = randFirstName()
        const familyName = randLastName()

        return {
          ...base,
          given_name: givenName,
          family_name: familyName,
        }
      }

      if (params.accountType === UserVerifyStateTypeEnum.FoP) {
        const givenName = randFirstName()
        const familyName = randLastName()

        return {
          ...base,
          given_name: givenName,
          family_name: familyName,
        }
      }

      if (params.accountType === UserVerifyStateTypeEnum.Po) {
        const name = randCompanyName()

        return {
          ...base,
          name,
        }
      }

      throw new Error('Invalid account type')
    }

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
          userAttributes: getUserAttributes(),
          userCreateDate: new Date('2024-01-01T00:00:00.000Z'),
          userLastModifiedDate: new Date('2024-01-02T00:00:00.000Z'),
          userStatus: 'CONFIRMED',
          username: randomSub,
        },
        cityAccountUser: getCityAccountUser(),
      },
    }
    this.authUsers.push(user)
    return user
  }

  createFoAuthUser({
    tier,
  }: {
    tier?: UserVerifyStateCognitoTierEnum
  } = {}) {
    return this.createAuthUser({
      accountType: UserVerifyStateTypeEnum.Fo,
      tier,
    })
  }

  createFopAuthUser({
    tier,
    ico,
  }: {
    tier?: UserVerifyStateCognitoTierEnum
    ico: string
  }) {
    return this.createAuthUser({
      accountType: UserVerifyStateTypeEnum.FoP,
      tier,
      ico,
    })
  }

  createPoAuthUser({
    tier,
    ico,
  }: {
    tier?: UserVerifyStateCognitoTierEnum
    ico: string
  }) {
    return this.createAuthUser({
      accountType: UserVerifyStateTypeEnum.Po,
      tier,
      ico,
    })
  }

  generateRandomIco() {
    let ico: string
    do {
      const randomNumber =
        Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000
      ico = `ico://sk/${randomNumber}`
    } while (this.generatedIcos.has(ico))

    this.generatedIcos.add(ico)
    return ico
  }

  createInvalidAuthUser(): AuthFixtureUser {
    return {
      sub: 'invalid-sub',
      headers: { Authorization: 'Bearer invalidToken' },
      user: {} as AuthUser,
    }
  }

  createInvalidGuestUser(): GuestFixtureUser {
    return {
      identityId: 'invalid-guest-id',
      headers: { 'X-Cognito-Guest-Identity-Id': 'invalid-guest-id' },
      user: {} as GuestUser,
    }
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
          throw new UnauthorizedException('Invalid bearer token')
        },
      } satisfies Partial<CognitoJwtVerifyService>)
      .overrideProvider(CognitoUserService)
      .useValue({
        getUserAttributes: async (sub: string) => {
          const userFixture = this.authUsers.find(
            (fixture) => fixture.sub === sub,
          )
          if (userFixture) return userFixture.user.cognitoUser
          throw new UnauthorizedException('Invalid sub')
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
          throw new UnauthorizedException('Invalid bearer token')
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
