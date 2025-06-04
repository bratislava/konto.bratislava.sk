import { Test } from '@nestjs/testing'

import {
  AuthFixtureUser,
  GuestFixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user'
import {
  initializeTestingApp,
  TestingApp,
} from '../../test/initialize-testing-app'
import { AppV2Module } from '../app-v2.module'
import { PrepareMigrationInput } from './inputs/prepare-migration.input'
import { PrepareMigrationOutput } from './outputs/prepare-migration.output'

describe('Form migration', () => {
  let testingApp: TestingApp
  let userFactory: UserFixtureFactory

  let authUser: AuthFixtureUser
  let guestUser: GuestFixtureUser

  beforeAll(async () => {
    userFactory = new UserFixtureFactory()

    authUser = userFactory.createFoAuthUser()
    guestUser = userFactory.createGuestUser()

    const moduleRef = await userFactory
      .setupMockAuth(
        Test.createTestingModule({
          imports: [AppV2Module],
        }),
      )
      .compile()

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
      guestIdentityId: guestUser.identityId,
    }
    const response = await testingApp.axiosClient.post<PrepareMigrationOutput>(
      '/forms/migrations/prepare',
      body,
      { headers: authUser.headers },
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
        guestIdentityId: guestUser.identityId,
      },
    )

    expect(response.status).toBe(201)
    expect(response.data).toEqual({
      success: true,
    })
  })
})
