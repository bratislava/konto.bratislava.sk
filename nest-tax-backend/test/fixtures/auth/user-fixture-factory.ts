import { randomUUID } from 'node:crypto'

import { UnauthorizedException } from '@nestjs/common'
import { TestingModuleBuilder } from '@nestjs/testing'
import { COGNITO_JWT_VERIFIER_INSTANCE_TOKEN } from '@nestjs-cognito/core'
import {
  CognitoUserAttributesTierEnum,
  ResponseUserDataDto,
  UserOfficialCorrespondenceChannelEnum,
} from 'openapi-clients/city-account'

import { CognitoSubservice } from '../../../src/utils/subservices/cognito.subservice'
import { generateBirthNumber } from '../birth-number'

export interface FixtureUser {
  sub: string
  token: string
  headers: {
    Authorization: string
  }
  tier: CognitoUserAttributesTierEnum
  cityAccountUser: ResponseUserDataDto
}

/**
 * Creates users and replaces Cognito in the testing module, so requests with `user.headers` are authenticated.
 *
 * - The JWT verifier accepts only tokens of users created by this factory.
 * - `CognitoSubservice` (used by `TiersGuard`) returns the tier of the user.
 *
 * City account (`@BratislavaUser()`) is mocked separately over HTTP by `CityAccountMock`.
 */
export class UserFixtureFactory {
  private readonly users: FixtureUser[] = []

  createUser({
    tier = CognitoUserAttributesTierEnum.IdentityCard,
    birthNumber = generateBirthNumber(),
  }: {
    tier?: CognitoUserAttributesTierEnum
    /** Without slash. `null` creates a user without a verified birth number. */
    birthNumber?: string | null
  } = {}): FixtureUser {
    const sub = randomUUID()
    const token = randomUUID()

    const user: FixtureUser = {
      sub,
      token,
      headers: { Authorization: `Bearer ${token}` },
      tier,
      cityAccountUser: {
        id: randomUUID(),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        externalId: sub,
        email: `${sub}@example.com`,
        birthNumber,
        officialCorrespondenceChannel:
          UserOfficialCorrespondenceChannelEnum.Postal,
        showEmailCommunicationBanner: false,
        hasChangedDeliveryMethodAfterDeadline: false,
        consents: [],
      },
    }

    this.users.push(user)
    return user
  }

  /** Headers with a token that is not accepted by the mocked JWT verifier. */
  static invalidTokenHeaders() {
    return { Authorization: `Bearer ${randomUUID()}` }
  }

  setupMockAuth(module: TestingModuleBuilder): TestingModuleBuilder {
    return module
      .overrideProvider(COGNITO_JWT_VERIFIER_INSTANCE_TOKEN)
      .useValue({
        verify: async (token: string) => {
          const user = this.users.find((fixture) => fixture.token === token)
          if (!user) {
            throw new UnauthorizedException('Invalid bearer token')
          }
          return Promise.resolve({
            sub: user.sub,
            username: user.sub,
            token_use: 'access',
          })
        },
      })
      .overrideProvider(CognitoSubservice)
      .useValue({
        getUserTierFromCognito: async (sub: string) => {
          const user = this.users.find((fixture) => fixture.sub === sub)
          if (!user) {
            throw new UnauthorizedException('Invalid sub')
          }
          return Promise.resolve(user.tier)
        },
      } satisfies Partial<CognitoSubservice>)
  }
}
