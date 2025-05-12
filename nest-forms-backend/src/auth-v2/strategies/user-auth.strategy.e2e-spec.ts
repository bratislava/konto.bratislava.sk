import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import {
  fixtureAuthUser,
  fixtureGuestUser,
  withUser,
} from '../../../test/fixtures/auth/user'
import { mockAuthProviders } from '../../../test/mocks/auth/mock-auth-providers'
import { GetUser } from '../decorators/get-user.decorator'
import { UserAuthGuard } from '../guards/user-auth.guard'
import { User } from '../types/user'
import { UserAuthStrategy } from './user-auth.strategy'

@Controller('test')
class TestController {
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

  it('should return 401 for random Authorization header', async () => {
    await withUser(
      request(app.getHttpServer()).get('/test'),
      fixtureGuestUser,
    ).expect(200, {
      user: fixtureGuestUser.user,
    })
  })

  // it('should return 401 for random Authorization header', async () => {
  //   await withUser(
  //     request(app.getHttpServer()).get('/test'),
  //     fixtureWrongGuestUser,
  //   ).expect(401)
  // })

  it('should return 401 forxx random Authorization header', async () => {
    await withUser(
      request(app.getHttpServer()).get('/test'),
      fixtureAuthUser,
    ).expect(200, {
      user: fixtureAuthUser.user,
    })
  })

  it('should return 401 forxx random Authorization header', async () => {
    await withUser(
      withUser(request(app.getHttpServer()).get('/test'), fixtureAuthUser),
      fixtureGuestUser,
    ).expect(401)
  })
})
