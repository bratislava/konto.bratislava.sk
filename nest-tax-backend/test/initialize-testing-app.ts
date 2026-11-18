import { NestExpressApplication } from '@nestjs/platform-express'
import { SchedulerRegistry } from '@nestjs/schedule'
import { TestingModule } from '@nestjs/testing'
import axios from 'axios'
import nock from 'nock'

import { bootstrap } from '../src/bootstrap'

/**
 * Starts the app on a random port and returns an axios client for it.
 *
 * Cron jobs are stopped right after start, tests run the tasks by calling `TasksService` methods directly.
 * Outgoing HTTP is blocked by nock except for localhost, so every external service has to be mocked explicitly.
 * Postgres and MSSQL use raw TCP and are not affected.
 *
 * Based on:
 * https://github.com/goldbergyoni/nodejs-testing-best-practices/blob/master/recipes/nestjs/test/basic-nest-tests.test.ts
 */
export async function initializeTestingApp(testingModuleRef: TestingModule) {
  const app = testingModuleRef.createNestApplication<NestExpressApplication>()
  bootstrap({ app, testEnvironment: true })
  await app.listen(0)

  const schedulerRegistry = app.get(SchedulerRegistry)
  schedulerRegistry.getCronJobs().forEach((job) => {
    void job.stop()
  })

  nock.disableNetConnect()
  nock.enableNetConnect('127.0.0.1')

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
  }

  const afterAll = async () => {
    await app.close()
    nock.enableNetConnect()
  }

  return { app, axiosClient, afterEach, afterAll }
}

export type TestingApp = Awaited<ReturnType<typeof initializeTestingApp>>
