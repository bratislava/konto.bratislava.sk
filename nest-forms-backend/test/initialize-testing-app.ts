import { NestExpressApplication } from '@nestjs/platform-express'
import { TestingModule } from '@nestjs/testing'
import axios, { AxiosInstance } from 'axios'
import * as nock from 'nock'

import { bootstrap } from '../src/app'

export type TestingApp = {
  app: NestExpressApplication
  axiosClient: AxiosInstance
  close: () => Promise<void>
  clean: () => void
}

export async function initializeTestingApp(
  testingModuleRef: TestingModule,
): Promise<TestingApp> {
  const app = testingModuleRef.createNestApplication<NestExpressApplication>()
  bootstrap({ app })
  await app.listen(0)

  nock.disableNetConnect()
  // eslint-disable-next-line pii/no-ip
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

  const close = async () => {
    await app.close()
    nock.enableNetConnect()
  }

  const clean = () => {
    nock.cleanAll()
  }

  return { app, axiosClient, close, clean }
}
