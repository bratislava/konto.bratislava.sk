import supertest from 'supertest'

import { User, UserType } from '../../../src/auth-v2/types/user'

export const fixtureGuestUserIdentityId = '00000000-0000-0000-0000-000000000000'
export const fixtureWrongGuestUserIdentityId =
  '00000000-0000-0000-0000-000000000001'

type FixtureUser = {
  headers: Record<string, string>
  user: User
}

export const fixtureGuestUser: FixtureUser = {
  headers: {
    'X-Cognito-Guest-Identity-Id': fixtureGuestUserIdentityId,
  },
  user: {
    type: UserType.Guest,
    cognitoIdentityId: fixtureGuestUserIdentityId,
  },
}

export const fixtureWrongGuestUser = {
  headers: {
    'X-Cognito-Guest-Identity-Id': fixtureWrongGuestUserIdentityId,
  },
}

export const fixtureAuthUserBearerToken = 'authUserBearerToken'
export const fixtureAuthUserSub = '00000000-0000-0000-0000-000000000002'

export const fixtureAuthUser: FixtureUser = {
  headers: {
    Authorization: `Bearer ${fixtureAuthUserBearerToken}`,
  },
  user: {
    type: UserType.Auth,
    cognitoPayload: {
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
    cognitoAttributes: {
      $metadata: {
        httpStatusCode: 200,
        requestId: '00000000-0000-0000-0000-000000000006',
        attempts: 1,
        totalRetryDelay: 0,
      },
      Enabled: true,
      UserAttributes: [
        {
          Name: 'sub',
          Value: fixtureAuthUserSub,
        },
        {
          Name: 'custom:account_type',
          Value: 'fo',
        },
        {
          Name: 'custom:tier',
          Value: 'QUEUE_IDENTITY_CARD',
        },
        {
          Name: 'given_name',
          Value: 'John',
        },
        {
          Name: 'family_name',
          Value: 'Doe',
        },
        {
          Name: 'email',
          Value: 'user@example.com',
        },
      ],
      // @ts-ignore
      UserCreateDate: '2024-01-01T00:00:00.000Z',
      // @ts-ignore
      UserLastModifiedDate: '2024-01-02T00:00:00.000Z',
      UserStatus: 'CONFIRMED',
      Username: fixtureAuthUserSub,
    },
    cityAccountUser: {
      id: '00000000-0000-0000-0000-000000000007',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      externalId: fixtureAuthUserSub,
      email: 'user@example.com',
      birthNumber: null,
      wasVerifiedBeforeTaxDeadline: false,
      officialCorrespondenceChannel: 'POSTAL',
      showEmailCommunicationBanner: false,
      gdprData: [],
    },
  },
}

export function withUser<Request extends supertest.Test>(
  req: Request,
  user: FixtureUser,
) {
  let _req = req
  Object.entries(user.headers).forEach(([key, value]) => {
    _req = _req.set(key, value)
  })
  return _req
}
