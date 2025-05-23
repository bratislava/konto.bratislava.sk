import jwt from 'jsonwebtoken'
import {
  UserOfficialCorrespondenceChannelEnum,
  UserVerifyStateCognitoTierEnum,
  UserVerifyStateTypeEnum,
} from 'openapi-clients/city-account'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import { AuthUser, GuestUser, UserType } from '../../../src/auth-v2/types/user'

type GuestFixtureUser = {
  identityId: string
  headers: {
    'X-Cognito-Guest-Identity-Id': string
  }
  user: GuestUser
}
type AuthFixtureUser = {
  sub: string
  headers: {
    Authorization: string
  }
  user: AuthUser
}

type FixtureUser = GuestFixtureUser | AuthFixtureUser

const getRandomGuestIdentityId = () => `eu-central-1:${uuidv4()}`

export function createGuestUserFixture(): GuestFixtureUser {
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

const mockJwtSignSecret = 'secret'

export function createAuthUserFixture({
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
}): AuthFixtureUser {
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
  const bearerToken = jwt.sign(cognitoPayloadRaw, mockJwtSignSecret, {
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

export const fixtureGuestUser1 = createGuestUserFixture()
export const fixtureGuestUser2 = createGuestUserFixture()

export const fixtureAuthUserFo = createAuthUserFixture({})
export const fixtureAuthUserPo = createAuthUserFixture({
  accountType: UserVerifyStateTypeEnum.Po,
})

export const fixtureGuestUsers = [fixtureGuestUser1, fixtureGuestUser2]
export const fixtureAuthUsers = [fixtureAuthUserFo, fixtureAuthUserPo]

export const fixtureInvalidGuestUser = {
  headers: {
    'X-Cognito-Guest-Identity-Id': getRandomGuestIdentityId(),
  },
}

export const fixtureInvalidAuthUser = {
  headers: {
    Authorization: 'Bearer invalidToken',
  },
}

export function withUser<Request extends supertest.Test>(
  req: Request,
  user:
    | FixtureUser
    | typeof fixtureInvalidGuestUser
    | typeof fixtureInvalidAuthUser,
) {
  let newReq = req
  Object.entries(user.headers).forEach(([key, value]) => {
    newReq = newReq.set(key, value)
  })
  return newReq
}
