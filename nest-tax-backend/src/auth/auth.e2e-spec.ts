import { ErrorEnum } from '@bratislava/log-nest'
import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CognitoUserAttributesTierEnum } from 'openapi-clients/city-account'

import {
  FixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user-fixture-factory'
import {
  CityAccountEndpoint,
  CityAccountMock,
} from '../../test/fixtures/mocks/city-account.mock'
import {
  initializeTestingApp,
  TestingApp,
} from '../../test/initialize-testing-app'
import { AppModule } from '../app.module'
import BaConfigService from '../config/ba-config.service'
import { TaxType } from '../generated/prisma/client'
import { TaxAvailabilityStatus } from '../tax/dtos/response.tax.dto'

const TAXES_URL = `/v2/tax/taxes?type=${TaxType.DZN}`

describe('Authentication and authorization', () => {
  let testingApp: TestingApp
  let userFixtureFactory: UserFixtureFactory
  let cityAccountMock: CityAccountMock

  let verifiedUser: FixtureUser
  let unverifiedUser: FixtureUser
  let userWithoutBirthNumber: FixtureUser
  let userUnknownToCityAccount: FixtureUser

  beforeAll(async () => {
    userFixtureFactory = new UserFixtureFactory()
    cityAccountMock = new CityAccountMock()

    verifiedUser = userFixtureFactory.createUser()
    unverifiedUser = userFixtureFactory.createUser({
      tier: CognitoUserAttributesTierEnum.New,
    })
    userWithoutBirthNumber = userFixtureFactory.createUser({
      birthNumber: null,
    })
    userUnknownToCityAccount = userFixtureFactory.createUser()

    cityAccountMock.addUser(verifiedUser)
    cityAccountMock.addUser(unverifiedUser)
    cityAccountMock.addUser(userWithoutBirthNumber)

    testingApp = await initializeTestingApp(
      userFixtureFactory.setupMockAuth(
        Test.createTestingModule({ imports: [AppModule] }),
      ),
    )
  })

  beforeEach(() => {
    cityAccountMock.install()
  })

  afterEach(() => {
    testingApp.afterEach()
  })

  afterAll(async () => {
    await testingApp.afterAll()
  })

  describe('User endpoints', () => {
    it('should return 401 without Authorization header', async () => {
      const response = await testingApp.axiosClient.get(TAXES_URL)

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
    })

    it('should return 401 for an invalid token', async () => {
      const response = await testingApp.axiosClient.get(TAXES_URL, {
        headers: UserFixtureFactory.invalidTokenHeaders(),
      })

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
    })

    it('should return 403 when the user is not verified with identity card', async () => {
      const response = await testingApp.axiosClient.get(TAXES_URL, {
        headers: unverifiedUser.headers,
      })

      expect(response.status).toBe(HttpStatus.FORBIDDEN)
      expect(cityAccountMock.requests).toEqual([])
    })

    it('should return 200 for a verified user', async () => {
      const response = await testingApp.axiosClient.get(TAXES_URL, {
        headers: verifiedUser.headers,
      })

      expect(response.status).toBe(HttpStatus.OK)
      expect(response.data).toEqual({
        availabilityStatus: TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
        items: [],
        taxAdministrator: null,
      })
    })

    // A verified user must have a birth number, missing one is inconsistent data in city account
    it('should return 500 when the verified user has no birth number in city account', async () => {
      const response = await testingApp.axiosClient.get(TAXES_URL, {
        headers: userWithoutBirthNumber.headers,
      })

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(response.data).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: 'Internal server error',
        errorName: ErrorEnum.INTERNAL_SERVER_ERROR,
        message: 'Get or create user error',
      })
    })

    it('should return 401 when city account rejects the token', async () => {
      const response = await testingApp.axiosClient.get(TAXES_URL, {
        headers: userUnknownToCityAccount.headers,
      })

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
    })

    it.each([
      HttpStatus.UNAUTHORIZED,
      HttpStatus.FORBIDDEN,
      HttpStatus.NOT_FOUND,
    ])('should pass city account status %i through', async (status) => {
      cityAccountMock.failEndpoint(CityAccountEndpoint.UpsertUser, status)

      const response = await testingApp.axiosClient.get(TAXES_URL, {
        headers: verifiedUser.headers,
      })

      expect(response.status).toBe(status)
    })

    it('should return 502 when city account fails', async () => {
      cityAccountMock.failEndpoint(
        CityAccountEndpoint.UpsertUser,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )

      const response = await testingApp.axiosClient.get(TAXES_URL, {
        headers: verifiedUser.headers,
      })

      expect(response.status).toBe(HttpStatus.BAD_GATEWAY)
    })
  })

  describe('Admin endpoints', () => {
    const DELETE_TAX_URL = '/admin/delete-tax'

    it('should return 401 without apiKey header', async () => {
      const response = await testingApp.axiosClient.post(DELETE_TAX_URL, {})

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
    })

    it('should return 401 for a wrong apiKey', async () => {
      const response = await testingApp.axiosClient.post(
        DELETE_TAX_URL,
        {},
        { headers: { apiKey: 'wrong-key' } },
      )

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
    })

    it('should pass the guard with the correct apiKey', async () => {
      const response = await testingApp.axiosClient.post(
        DELETE_TAX_URL,
        {},
        {
          headers: {
            apiKey: testingApp.app.get(BaConfigService).tokens.adminAppSecret,
          },
        },
      )

      // Empty body fails validation, which runs only after the guard lets the request through
      expect(response.status).toBe(HttpStatus.BAD_REQUEST)
    })
  })
})
