import { Test } from '@nestjs/testing'
import { UserVerifyStateTypeEnum } from 'openapi-clients/city-account'

import {
  AuthFixtureUser,
  GuestFixtureUser,
} from '../../test/fixtures/auth/user'
import { UserTestFactory } from '../../test/fixtures/auth/user-test-factory'
import {
  initializeTestingApp,
  TestingApp,
} from '../../test/initialize-testing-app'
import { AppV2Module } from '../app-v2.module'
import { PrepareMigrationInput } from './inputs/prepare-migration.input'
import { PrepareMigrationOutput } from './outputs/prepare-migration.output'

describe('Form Migration', () => {
  let testingApp: TestingApp
  let userFactory: UserTestFactory

  // Create users with clean destructuring syntax
  let foUser: AuthFixtureUser
  let poUser: AuthFixtureUser
  let guestUser: GuestFixtureUser

  beforeAll(async () => {
    userFactory = new UserTestFactory()

    // This is the syntax you wanted!
    const { authUsers, guestUsers } = userFactory.createUsers({
      authUsers: [
        { accountType: UserVerifyStateTypeEnum.Fo }, // foUser
        { accountType: UserVerifyStateTypeEnum.Po }, // poUser
      ],
      guestUsers: 1, // guestUser
    })

    // Destructure for convenience
    ;[foUser, poUser] = authUsers
    ;[guestUser] = guestUsers

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
    userFactory.clear()
    await testingApp.afterAll()
  })

  it('should migrate forms', async () => {
    const body: PrepareMigrationInput = {
      guestIdentityId: guestUser.identityId,
    }
    const response = await testingApp.axiosClient.post<PrepareMigrationOutput>(
      '/forms/migrations/prepare',
      body,
      { headers: foUser.headers },
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
