import { Test } from '@nestjs/testing'

import {
  initializeTestingApp,
  TestingApp,
} from '../test/initialize-testing-app'
import { AppModule } from './app.module'

describe('App', () => {
  let testingApp: TestingApp

  beforeAll(async () => {
    testingApp = await initializeTestingApp(
      Test.createTestingModule({ imports: [AppModule] }),
    )
    return async () => testingApp.afterAll()
  })

  afterEach(() => {
    testingApp.afterEach()
  })

  it('should respond to healthcheck', async () => {
    const response = await testingApp.axiosClient.get('/healthcheck')

    expect(response.status).toBe(200)
    expect(response.data).toBe('OK')
  })
})
