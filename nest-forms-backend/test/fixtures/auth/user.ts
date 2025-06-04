import jwt from 'jsonwebtoken'
import {
  UserOfficialCorrespondenceChannelEnum,
  UserVerifyStateCognitoTierEnum,
  UserVerifyStateTypeEnum,
} from 'openapi-clients/city-account'
import { v4 as uuidv4 } from 'uuid'

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

  createGuestUser(): GuestFixtureUser {
    const randomGuestIdentityId = getRandomGuestIdentityId()

    return {
      identityId: randomGuestIdentityId,
      headers: {
        'X-Cognito-Guest-Identity-Id': randomGuestIdentityId,
      },
      user: {
        type: UserType.Guest,
        cognitoIdentityId: randomGuestIdentityId,
      },
    }
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
    return {
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

  // Create multiple users at once
  createAuthUsers(
    count: number,
    options?: Parameters<typeof this.createAuthUser>[0][],
  ): AuthFixtureUser[] {
    return Array.from({ length: count }, (_, index) => {
      const userOptions = options?.[index] || {}
      return this.createAuthUser(userOptions)
    })
  }

  createGuestUsers(count: number): GuestFixtureUser[] {
    return Array.from({ length: count }, () => this.createGuestUser())
  }
}
