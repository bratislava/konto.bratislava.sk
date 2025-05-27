import { Test } from '@nestjs/testing'

import {
  fixtureAuthUserFo,
  fixtureGuestUser1,
} from '../../test/fixtures/auth/user'
import {
  initializeTestingApp,
  TestingApp,
} from '../../test/initialize-testing-app'
import { withMockAuth } from '../../test/mocks/auth/mock-auth-providers'
import { AppV2Module } from '../app-v2.module'
import { PrepareMigrationInput } from './inputs/prepare-migration.input'
import { PrepareMigrationOutput } from './outputs/prepare-migration.output copy'

describe('Form Migration', () => {
  let e2eApp: TestingApp

  beforeAll(async () => {
    const moduleRef = await withMockAuth(
      Test.createTestingModule({
        imports: [AppV2Module],
      }),
    ).compile()

    e2eApp = await initializeTestingApp(moduleRef)
  })

  afterEach(async () => {
    await e2eApp.clean()
  })

  afterAll(async () => {
    await e2eApp.close()
  })

  it('should migrate forms', async () => {
    const body: PrepareMigrationInput = {
      guestIdentityId: fixtureGuestUser1.identityId,
    }
    const response = await e2eApp.axiosClient.post<PrepareMigrationOutput>(
      '/forms/migrations/prepare',
      body,
      { headers: fixtureAuthUserFo.headers },
    )

    expect(response.status).toBe(201)
    expect(response.data).toEqual({
      success: true,
    })
  })

  it('should xx forms', async () => {
    const response = await e2eApp.axiosClient.post(
      '/forms/migrations/prepare',
      {
        guestIdentityId: fixtureGuestUser1.identityId,
      },
    )

    expect(response.status).toBe(201)
    expect(response.data).toEqual({
      success: true,
    })
  })
})
