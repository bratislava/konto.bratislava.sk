import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import {
  fixtureAuthUserFo,
  fixtureGuestUser1,
  withUser,
} from '../../test/fixtures/auth/user'
import { withMockAuth } from '../../test/mocks/auth/mock-auth-providers'
import { bootstrap } from '../app'
import { AppV2Module } from '../app-v2.module'

describe('Form Migration', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await withMockAuth(
      Test.createTestingModule({
        imports: [AppV2Module],
      }),
    ).compile()

    app = moduleRef.createNestApplication()
    bootstrap({ app })

    await app.init()
  })

  it('should migrate forms', async () => {
    await withUser(
      request(app.getHttpServer()).post('/forms/migrations/prepare').send({
        guestIdentityId: fixtureGuestUser1.identityId,
      }),
      fixtureAuthUserFo,
    ).expect(201, {
      success: true,
    })
  })
})
