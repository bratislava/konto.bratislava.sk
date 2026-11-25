import { NestExpressApplication } from '@nestjs/platform-express'
import { ScheduleExplorer } from '@nestjs/schedule'
import { TestingModuleBuilder } from '@nestjs/testing'
import axios from 'axios'
import nock from 'nock'

import { bootstrap } from '../src/bootstrap'

/**
 * Compiles the testing module, starts the app on a random port and returns an axios client for it.
 *
 * Cron jobs are never registered, tests run the tasks by calling `TasksService` methods directly.
 * Outgoing HTTP is blocked by nock except for localhost, so every external service has to be mocked explicitly.
 * Postgres and MSSQL use raw TCP and are not affected.
 *
 * Based on:
 * https://github.com/goldbergyoni/nodejs-testing-best-practices/blob/master/recipes/nestjs/test/basic-nest-tests.test.ts
 */
export async function initializeTestingApp(
  testingModuleBuilder: TestingModuleBuilder,
) {
  nock.disableNetConnect()
  nock.enableNetConnect('127.0.0.1')

  const testingModuleRef = await testingModuleBuilder
    // The explorer finds the `@Cron` methods and registers them, without it no job is scheduled
    .overrideProvider(ScheduleExplorer)
    .useValue({})
    .compile()
  const app = testingModuleRef.createNestApplication<NestExpressApplication>()
  try {
    bootstrap({ app, testEnvironment: true })
    await app.listen(0)
  } catch (error) {
    await app.close()
    throw error
  }

  const address = app.getHttpServer().address()
  if (!address || typeof address !== 'object') {
    throw new Error('Failed to get address')
  }

  const axiosClient = axios.create({
    baseURL: `http://127.0.0.1:${address.port}`,
    validateStatus: () => true, // Don't throw HTTP exceptions. Delegate to the tests to decide which error is acceptable
  })

  const afterEach = () => {
    nock.cleanAll()
    // Restores the real time after `setCurrentTime()`
    vi.useRealTimers()
  }

  const afterAll = async () => {
    await app.close()
    nock.enableNetConnect()
  }

  return { app, axiosClient, afterEach, afterAll }
}

export type TestingApp = Awaited<ReturnType<typeof initializeTestingApp>>
