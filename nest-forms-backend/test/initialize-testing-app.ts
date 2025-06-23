import { NestExpressApplication } from '@nestjs/platform-express'
import { TestingModule } from '@nestjs/testing'
import axios from 'axios'
import * as nock from 'nock'

import { bootstrap } from '../src/bootstrap'

/**
 * Based on:
 * https://github.com/goldbergyoni/nodejs-testing-best-practices/blob/master/recipes/nestjs/test/basic-nest-tests.test.ts
 * https://github.com/goldbergyoni/nodejs-testing-best-practices/blob/master/recipes/nestjs/main.ts
 */
export async function initializeTestingApp(testingModuleRef: TestingModule) {
  const app = testingModuleRef.createNestApplication<NestExpressApplication>()
  bootstrap({ app, testEnvironment: true })
  await app.listen(0)

  nock.disableNetConnect()
  nock.enableNetConnect('127.0.0.1')

  const address = app.getHttpServer().address()
  if (!address || typeof address !== 'object') {
    throw new Error('Failed to get address')
  }

  const axiosConfig = {
    baseURL: `http://127.0.0.1:${address.port}`,
    validateStatus: () => true, // Don't throw HTTP exceptions. Delegate to the tests to decide which error is acceptable
  }
  const axiosClient = axios.create(axiosConfig)

  const afterEach = () => {
    nock.cleanAll()
  }

  const afterAll = async () => {
    await app.close()
    nock.enableNetConnect()
  }

  return { app, axiosClient, afterEach, afterAll }
}

export type TestingApp = Awaited<ReturnType<typeof initializeTestingApp>>
