import { Controller, Get, UseGuards } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import {
  AuthFixtureUser,
  GuestFixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user-fixture-factory'
import {
  initializeTestingApp,
  TestingApp,
} from '../../test/initialize-testing-app'
import { AppV2Module } from '../app-v2.module'
import { AllowedUserTypes } from './decorators/allowed-user-types.decorator'
import { GetUser } from './decorators/get-user.decorator'
import { UserAuthGuard } from './guards/user-auth.guard'
import { User, UserType } from './types/user'

/**
 * The `User` type is an object that contains Date objects. This function stringifies
 * the Date objects so the assertion can be made.
 */
function createAssertionSafeUser<T>(user: T) {
  // eslint-disable-next-line unicorn/prefer-structured-clone
  return JSON.parse(JSON.stringify(user)) as T
}

@Controller('test-auth-e2e')
class TestController {
  @Get('allows-both')
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard)
  allowsBothRoute(@GetUser() user: User) {
    return { user }
  }

  @Get('guest-only')
  @AllowedUserTypes([UserType.Guest])
  @UseGuards(UserAuthGuard)
  testGuestOnlyRoute(@GetUser() user: User) {
    return { user }
  }

  @Get('auth-only')
  @AllowedUserTypes([UserType.Auth])
  @UseGuards(UserAuthGuard)
  testAuthOnlyRoute(@GetUser() user: User) {
    return { user }
  }

  @Get('missing-decorator-route')
  @UseGuards(UserAuthGuard)
  testMissingDecorator(@GetUser() user: User) {
    return { user }
  }

  @Get('empty-decorator-route')
  @AllowedUserTypes([])
  @UseGuards(UserAuthGuard)
  testEmptyDecorator(@GetUser() user: User) {
    return { user }
  }
}

describe('User Auth', () => {
  let testingApp: TestingApp
  let userFixtureFactory: UserFixtureFactory
  let authUser: AuthFixtureUser
  let guestUser: GuestFixtureUser
  let invalidAuthUser: AuthFixtureUser
  let invalidGuestUser: GuestFixtureUser

  beforeAll(async () => {
    userFixtureFactory = new UserFixtureFactory()
    authUser = userFixtureFactory.createFoAuthUser()
    guestUser = userFixtureFactory.createGuestUser()

    invalidAuthUser = userFixtureFactory.createInvalidAuthUser()
    invalidGuestUser = userFixtureFactory.createInvalidGuestUser()

    const moduleRef = await userFixtureFactory
      .setupMockAuth(
        Test.createTestingModule({
          imports: [AppV2Module],
          controllers: [TestController],
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

  describe('Route: /test-auth-e2e/allows-both (Allows Auth and Guest)', () => {
    it('should allow access for authenticated users (200)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/allows-both',
        { headers: authUser.headers },
      )

      expect(response.status).toBe(200)
      expect(response.data).toEqual({
        user: createAssertionSafeUser(authUser.user),
      })
    })

    it('should allow access for guest users (200)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/allows-both',
        { headers: guestUser.headers },
      )

      expect(response.status).toBe(200)
      expect(response.data).toEqual({
        user: guestUser.user,
      })
    })

    it('should reject unauthenticated requests (401)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/allows-both',
      )
      expect(response.status).toBe(401)
    })
  })

  describe('Route: /test-auth-e2e/guest-only (Allows Guest only)', () => {
    it('should allow guest users (200)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/guest-only',
        { headers: guestUser.headers },
      )

      expect(response.status).toBe(200)
      expect(response.data).toEqual({
        user: guestUser.user,
      })
    })

    it('should reject authenticated (non-guest) users (401)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/guest-only',
        {
          headers: authUser.headers,
        },
      )
      expect(response.status).toBe(401)
    })

    it('should reject unauthenticated requests (401)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/guest-only',
      )
      expect(response.status).toBe(401)
    })
  })

  describe('Route: /test-auth-e2e/auth-only (Allows Auth only)', () => {
    it('should allow authenticated (non-guest) users (200)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/auth-only',
        { headers: authUser.headers },
      )

      expect(response.status).toBe(200)
      expect(response.data).toEqual({
        user: createAssertionSafeUser(authUser.user),
      })
    })

    it('should reject guest users (401)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/auth-only',
        {
          headers: guestUser.headers,
        },
      )
      expect(response.status).toBe(401)
    })

    it('should reject unauthenticated requests (401)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/auth-only',
      )
      expect(response.status).toBe(401)
    })
  })

  describe('General Guard and Strategy Behaviors', () => {
    it('should reject requests with invalid bearer token (401)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/auth-only',
        {
          headers: invalidAuthUser.headers,
        },
      )
      expect(response.status).toBe(401)
    })

    it('should reject requests with invalid guest identity (401)', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/guest-only',
        {
          headers: invalidGuestUser.headers,
        },
      )
      expect(response.status).toBe(401)
    })

    it('should result in InternalServerError (500) if @AllowedUserTypes is missing', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/missing-decorator-route',
      )
      expect(response.status).toBe(500)
    })

    it('should result in InternalServerError (500) if @AllowedUserTypes is empty', async () => {
      const response = await testingApp.axiosClient.get(
        '/test-auth-e2e/empty-decorator-route',
      )
      expect(response.status).toBe(500)
    })
  })
})
