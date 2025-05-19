import {
  UserOfficialCorrespondenceChannelEnum,
  UserVerifyStateCognitoTierEnum,
  UserVerifyStateTypeEnum,
} from 'openapi-clients/city-account'
import supertest from 'supertest'

import { User, UserType } from '../../../src/auth-v2/types/user'

type FixtureUser = {
  headers: Record<string, string>
  user: User | null
}

export const fixtureGuestUserIdentityId = '00000000-0000-0000-0000-000000000000'
export const fixtureInvalidGuestUserIdentityId =
  '00000000-0000-0000-0000-000000000001'

export const fixtureGuestUser: FixtureUser = {
  headers: {
    'X-Cognito-Guest-Identity-Id': fixtureGuestUserIdentityId,
  },
  user: {
    type: UserType.Guest,
    cognitoIdentityId: fixtureGuestUserIdentityId,
  },
}

export const fixtureInvalidGuestUser: FixtureUser = {
  headers: {
    'X-Cognito-Guest-Identity-Id': fixtureInvalidGuestUserIdentityId,
  },
  user: null,
}

export const fixtureAuthUserSub = '00000000-0000-0000-0000-000000000002'
export const fixtureAuthUserBearerToken = 'authUserBearerToken'
export const fixtureInvalidAuthUserBearerToken = 'authUserWrongBearerToken'

export const fixtureAuthUser: FixtureUser = {
  headers: {
    Authorization: `Bearer ${fixtureAuthUserBearerToken}`,
  },
  user: {
    type: UserType.Auth,
    cognitoJwtPayload: {
      version: 1,
      sub: fixtureAuthUserSub,
      iss: 'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_FZDV0j2ZK',
      client_id: 'exampleclientid',
      origin_jti: '00000000-0000-0000-0000-000000000003',
      event_id: '00000000-0000-0000-0000-000000000004',
      token_use: 'access',
      scope: 'aws.cognito.signin.user.admin',
      auth_time: 1_700_000_000,
      exp: 1_700_000_100,
      iat: 1_700_000_000,
      jti: '00000000-0000-0000-0000-000000000005',
      username: fixtureAuthUserSub,
    },
    cognitoUser: {
      userAttributes: {
        sub: fixtureAuthUserSub,
        'custom:account_type': UserVerifyStateTypeEnum.Fo,
        'custom:tier': UserVerifyStateCognitoTierEnum.IdentityCard,
        given_name: 'John',
        family_name: 'Doe',
        // eslint-disable-next-line pii/no-email
        email: 'user@example.com',
      },
      userCreateDate: new Date('2024-01-01T00:00:00.000Z'),
      userLastModifiedDate: new Date('2024-01-02T00:00:00.000Z'),
      userStatus: 'CONFIRMED',
      username: fixtureAuthUserSub,
    },
    cityAccountUser: {
      id: '00000000-0000-0000-0000-000000000007',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      externalId: fixtureAuthUserSub,
      // eslint-disable-next-line pii/no-email
      email: 'user@example.com',
      birthNumber: null,
      wasVerifiedBeforeTaxDeadline: false,
      officialCorrespondenceChannel:
        UserOfficialCorrespondenceChannelEnum.Postal,
      showEmailCommunicationBanner: false,
      gdprData: [],
    },
  },
}

export const fixtureInvalidAuthUser: FixtureUser = {
  headers: {
    Authorization: `Bearer ${fixtureInvalidAuthUserBearerToken}`,
  },
  user: null,
}

export function withUser<Request extends supertest.Test>(
  req: Request,
  user: FixtureUser,
) {
  let newReq = req
  Object.entries(user.headers).forEach(([key, value]) => {
    newReq = newReq.set(key, value)
  })
  return newReq
}
