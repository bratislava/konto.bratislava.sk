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
import { PrepareMigrationOutput } from './outputs/prepare-migration.output'

describe('Form Migration', () => {
  let testingApp: TestingApp

  beforeAll(async () => {
    const moduleRef = await withMockAuth(
      Test.createTestingModule({
        imports: [AppV2Module],
      }),
    ).compile()

    testingApp = await initializeTestingApp(moduleRef)
  })

  afterEach(() => {
    testingApp.afterEach()
  })

  afterAll(async () => {
    await testingApp.afterAll()
  })

  it('should migrate forms', async () => {
    const body: PrepareMigrationInput = {
      guestIdentityId: fixtureGuestUser1.identityId,
    }
    const response = await testingApp.axiosClient.post<PrepareMigrationOutput>(
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
    const response = await testingApp.axiosClient.post(
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
