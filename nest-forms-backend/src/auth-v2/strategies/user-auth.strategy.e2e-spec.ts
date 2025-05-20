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
import { GetUser } from '../decorators/get-user.decorator'
import { UserAuthGuard } from '../guards/user-auth.guard'
import { User } from '../types/user'
import { UserAuthStrategy } from './user-auth.strategy'

/**
 * The `User` type is an object that contains Date objects. This function stringifies
 * the Date objects so the assertion can be made.
 */
function createAssertionSafeUser<T>(user: T) {
  // eslint-disable-next-line unicorn/prefer-structured-clone
  return JSON.parse(JSON.stringify(user)) as T
}

// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided, @darraghor/nestjs-typed/controllers-should-supply-api-tags
@Controller('test')
class TestController {
  // eslint-disable-next-line @darraghor/nestjs-typed/api-method-should-specify-api-response
  @Get()
  @UseGuards(UserAuthGuard)
  testRoute(@GetUser() user: User) {
    return { user }
  }
}

describe('UserAuthStrategy', () => {
  let strategy: UserAuthStrategy
  let app: INestApplication

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [...mockAuthProviders, UserAuthStrategy, UserAuthGuard],
      controllers: [TestController],
    }).compile()

    strategy = module.get<UserAuthStrategy>(UserAuthStrategy)

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be defined', () => {
    expect(strategy).toBeDefined()
  })

  it('should allow access for authenticated users', async () => {
    await withUser(
      request(app.getHttpServer()).get('/test'),
      fixtureAuthUser,
    ).expect(200, {
      user: createAssertionSafeUser(fixtureAuthUser.user),
    })
  })

  it('should allow access for guest users', async () => {
    await withUser(
      request(app.getHttpServer()).get('/test'),
      fixtureGuestUser,
    ).expect(200, {
      user: fixtureGuestUser.user,
    })
  })

  it('should reject when multiple authentication methods are provided', async () => {
    await withUser(
      withUser(request(app.getHttpServer()).get('/test'), fixtureAuthUser),
      fixtureGuestUser,
    ).expect(401)
  })

  it('should reject requests with invalid bearer token', async () => {
    await withUser(
      request(app.getHttpServer()).get('/test'),
      fixtureInvalidAuthUser,
    ).expect(401)
  })

  it('should reject requests with invalid guest identity', async () => {
    await withUser(
      request(app.getHttpServer()).get('/test'),
      fixtureInvalidGuestUser,
    ).expect(401)
  })

  it('should reject requests with no authentication', async () => {
    await request(app.getHttpServer()).get('/test').expect(401)
  })
})
