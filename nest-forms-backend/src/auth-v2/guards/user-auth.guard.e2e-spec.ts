import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import {
  fixtureAuthUser,
  fixtureGuestUser,
  fixtureInvalidAuthUser,
  fixtureInvalidGuestUser,
  withUser,
} from '../../../test/fixtures/auth/user'
import { mockAuthProviders } from '../../../test/mocks/auth/mock-auth-providers'
import { AllowedUserTypes } from '../decorators/allowed-user-types.decorator' // Import AllowedUserTypes
import { GetUser } from '../decorators/get-user.decorator'
import { UserAuthStrategy } from '../strategies/user-auth.strategy'
import { User, UserType } from '../types/user' // Import UserType
import { UserAuthGuard } from './user-auth.guard'

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

describe('UserAuthGuard (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [...mockAuthProviders, UserAuthStrategy, UserAuthGuard],
      controllers: [TestController],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Route: /test-auth-e2e/allows-both (Allows Auth and Guest)', () => {
    it('should allow access for authenticated users (200)', async () => {
      await withUser(
        request(app.getHttpServer()).get('/test-auth-e2e/allows-both'),
        fixtureAuthUser,
      ).expect(200, {
        user: createAssertionSafeUser(fixtureAuthUser.user),
      })
    })

    it('should allow access for guest users (200)', async () => {
      await withUser(
        request(app.getHttpServer()).get('/test-auth-e2e/allows-both'),
        fixtureGuestUser,
      ).expect(200, {
        user: fixtureGuestUser.user,
      })
    })

    it('should reject unauthenticated requests (401)', async () => {
      await request(app.getHttpServer())
        .get('/test-auth-e2e/allows-both')
        .expect(401)
    })
  })

  describe('Route: /test-auth-e2e/guest-only (Allows Guest only)', () => {
    it('should allow guest users (200)', async () => {
      await withUser(
        request(app.getHttpServer()).get('/test-auth-e2e/guest-only'),
        fixtureGuestUser,
      ).expect(200, {
        user: fixtureGuestUser.user,
      })
    })

    it('should reject authenticated (non-guest) users (401)', async () => {
      await withUser(
        request(app.getHttpServer()).get('/test-auth-e2e/guest-only'),
        fixtureAuthUser,
      ).expect(401)
    })

    it('should reject unauthenticated requests (401)', async () => {
      await request(app.getHttpServer())
        .get('/test-auth-e2e/guest-only')
        .expect(401)
    })
  })

  describe('Route: /test-auth-e2e/auth-only (Allows Auth only)', () => {
    it('should allow authenticated (non-guest) users (200)', async () => {
      await withUser(
        request(app.getHttpServer()).get('/test-auth-e2e/auth-only'),
        fixtureAuthUser,
      ).expect(200, {
        user: createAssertionSafeUser(fixtureAuthUser.user),
      })
    })

    it('should reject guest users (401)', async () => {
      await withUser(
        request(app.getHttpServer()).get('/test-auth-e2e/auth-only'),
        fixtureGuestUser,
      ).expect(401)
    })

    it('should reject unauthenticated requests (401)', async () => {
      await request(app.getHttpServer())
        .get('/test-auth-e2e/auth-only')
        .expect(401)
    })
  })

  describe('General Guard and Strategy Behaviors', () => {
    it('should reject when multiple authentication methods are provided (401)', async () => {
      await withUser(
        withUser(
          request(app.getHttpServer()).get('/test-auth-e2e/allows-both'),
          fixtureAuthUser,
        ),
        fixtureGuestUser,
      ).expect(401)
    })

    it('should reject requests with invalid bearer token (401)', async () => {
      await withUser(
        request(app.getHttpServer()).get('/test-auth-e2e/auth-only'),
        fixtureInvalidAuthUser,
      ).expect(401)
    })

    it('should reject requests with invalid guest identity (401)', async () => {
      await withUser(
        request(app.getHttpServer()).get('/test-auth-e2e/guest-only'),
        fixtureInvalidGuestUser,
      ).expect(401)
    })

    it('should result in InternalServerError (500) if @AllowedUserTypes is missing', async () => {
      const response = await request(app.getHttpServer()).get(
        '/test-auth-e2e/missing-decorator-route',
      )
      expect(response.status).toBe(500)
    })

    it('should result in InternalServerError (500) if @AllowedUserTypes is empty', async () => {
      const response = await request(app.getHttpServer()).get(
        '/test-auth-e2e/empty-decorator-route',
      )
      expect(response.status).toBe(500)
    })
  })
})
