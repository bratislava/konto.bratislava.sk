import { HttpStatus } from '@nestjs/common'
import nock from 'nock'
import {
  GetNewVerifiedUsersBirthNumbersResponseDto,
  GetUserDataByBirthNumbersBatchResponseDto,
  ResponseUserByBirthNumberDto,
  ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum,
} from 'openapi-clients/city-account'
import { rodnecislo } from 'rodnecislo'
import { z } from 'zod'

import getBaConfigInstance from '../../../src/config/ba-config.instance'
import { FixtureUser } from '../auth/user-fixture-factory'

/**
 * Request validation of nest-city-account (`integration-request.dto.ts`), so a malformed request from the app gets 400
 * as it would from the real service.
 */
const birthNumberWithoutSlashSchema = z.string().regex(/^\d{9,10}$/)

const userDataQuerySchema = z.object({
  birthNumber: birthNumberWithoutSlashSchema.refine(
    (birthNumber) => rodnecislo(birthNumber).isValid(),
    'Invalid birth number',
  ),
})

// City account checks only that `birthNumbers` is an array. A birth number with slash would be silently not found
// there, so the mock rejects it to catch that.
const userDataBatchBodySchema = z.object({
  birthNumbers: z.array(birthNumberWithoutSlashSchema),
})

const newVerifiedUsersBodySchema = z.object({
  since: z.iso.datetime().transform((since) => new Date(since)),
  take: z.number().optional(),
})

export enum CityAccountEndpoint {
  UpsertUser = 'POST /user/upsert',
  UserData = 'GET /integration/userdata',
  UserDataBatch = 'POST /integration/userdata-batch',
  NewVerifiedUsers = 'POST /integration/get-verified-users-birth-numbers-batch',
}

const USER_REQUEST_LIMIT = 100

interface CityAccountMockUser {
  fixtureUser: FixtureUser
  verifiedAt: Date
  taxDeliveryMethodAtLockDate: ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum | null
}

/** `errorName` of every error response of the mock, so a test can tell where an error came from. */
export enum CityAccountMockErrorName {
  /** Set up by `failEndpoint()`. */
  ForcedFailure = 'CITY_ACCOUNT_MOCK_FORCED_FAILURE',
  /** The request failed the input validation of city account. */
  ValidationFailed = 'CITY_ACCOUNT_MOCK_VALIDATION_FAILED',
  InvalidApiKey = 'CITY_ACCOUNT_MOCK_INVALID_API_KEY',
  InvalidToken = 'CITY_ACCOUNT_MOCK_INVALID_TOKEN',
  UserNotFound = 'CITY_ACCOUNT_MOCK_USER_NOT_FOUND',
}

interface MockResponse {
  status: HttpStatus
  body: nock.ReplyBody
  /** Set for an error response, create those with `errorResponse()`. */
  errorName?: CityAccountMockErrorName
}

function errorResponse(
  status: HttpStatus,
  errorName: CityAccountMockErrorName,
  message: string,
): MockResponse {
  return { status, errorName, body: { errorName, message } }
}

export interface CityAccountRequest {
  endpoint: CityAccountEndpoint
  body: unknown
  status: HttpStatus
  /** Set when the mock responded with an error. */
  errorName?: CityAccountMockErrorName
}

/**
 * Fake nest-city-account, served over HTTP with nock. It keeps its own list of users, so the same user is returned by
 * `POST /user/upsert` (by bearer token) and by the integration endpoints (by birth number).
 *
 * Error responses have the body `{ errorName: CityAccountMockErrorName, message }`, and every request is recorded in
 * `requests` with its status and `errorName`.
 *
 * Interceptors are removed by `TestingApp.afterEach()` (`nock.cleanAll()`), so call `install()` in `beforeEach`.
 * Users survive `install()` (remove them with `clearUsers()`), failures and recorded requests do not.
 */
export class CityAccountMock {
  private readonly users: CityAccountMockUser[] = []

  private failures = new Map<CityAccountEndpoint, HttpStatus>()

  /** Requests received since the last `install()`. */
  requests: CityAccountRequest[] = []

  private readonly baseUrl: string

  private readonly adminApiKey: string

  constructor() {
    const { url, adminApiKey } = getBaConfigInstance().cityAccountBackend
    this.baseUrl = url
    this.adminApiKey = adminApiKey
  }

  addUser(
    fixtureUser: FixtureUser,
    {
      verifiedAt = new Date(),
      taxDeliveryMethodAtLockDate = null,
    }: Partial<Omit<CityAccountMockUser, 'fixtureUser'>> = {},
  ): void {
    this.users.push({ fixtureUser, verifiedAt, taxDeliveryMethodAtLockDate })
  }

  /** As if the user deleted their account, they are not found by token nor by birth number anymore. */
  removeUser(fixtureUser: FixtureUser): void {
    const index = this.users.findIndex(
      (user) => user.fixtureUser === fixtureUser,
    )
    if (index !== -1) {
      this.users.splice(index, 1)
    }
  }

  clearUsers(): void {
    this.users.length = 0
  }

  /** All following requests to the endpoint fail with the status, until the next `install()`. */
  failEndpoint(endpoint: CityAccountEndpoint, status: HttpStatus): void {
    this.failures.set(endpoint, status)
  }

  install(): void {
    this.failures = new Map()
    this.requests = []

    nock(this.baseUrl)
      .persist()
      .post('/user/upsert')
      .reply((request: Request) =>
        this.handle(CityAccountEndpoint.UpsertUser, undefined, () =>
          this.upsertUser(request.headers.get('authorization')),
        ),
      )
      .get('/integration/userdata')
      .query(true)
      .reply((request: Request) =>
        this.handleIntegration(
          request,
          CityAccountEndpoint.UserData,
          Object.fromEntries(new URL(request.url).searchParams),
          userDataQuerySchema,
          ({ birthNumber }) => {
            const user = this.findByBirthNumber(birthNumber)
            return user
              ? {
                  status: HttpStatus.OK,
                  body: CityAccountMock.toUserByBirthNumber(user),
                }
              : errorResponse(
                  HttpStatus.NOT_FOUND,
                  CityAccountMockErrorName.UserNotFound,
                  'User not found',
                )
          },
        ),
      )
      .post('/integration/userdata-batch')
      .reply(async (request: Request) =>
        this.handleIntegration(
          request,
          CityAccountEndpoint.UserDataBatch,
          await request.json(),
          userDataBatchBodySchema,
          ({ birthNumbers }) => {
            const response: GetUserDataByBirthNumbersBatchResponseDto = {
              users: Object.fromEntries(
                birthNumbers.flatMap((birthNumber) => {
                  const user = this.findByBirthNumber(birthNumber)
                  return user
                    ? [[birthNumber, CityAccountMock.toUserByBirthNumber(user)]]
                    : []
                }),
              ),
            }
            return { status: HttpStatus.OK, body: response }
          },
        ),
      )
      .post('/integration/get-verified-users-birth-numbers-batch')
      .reply(async (request: Request) =>
        this.handleIntegration(
          request,
          CityAccountEndpoint.NewVerifiedUsers,
          await request.json(),
          newVerifiedUsersBodySchema,
          (body) => ({
            status: HttpStatus.OK,
            body: this.getNewVerifiedUsers(body),
          }),
        ),
      )
  }

  /** Applies a forced failure of the endpoint, records the request and turns the response into a nock reply. */
  private handle(
    endpoint: CityAccountEndpoint,
    body: unknown,
    respond: () => MockResponse,
  ): nock.ReplyFnResult {
    const failureStatus = this.failures.get(endpoint)
    const response =
      failureStatus === undefined
        ? respond()
        : errorResponse(
            failureStatus,
            CityAccountMockErrorName.ForcedFailure,
            'Mocked city account failure',
          )

    this.requests.push({
      endpoint,
      body,
      status: response.status,
      errorName: response.errorName,
    })
    return [response.status, response.body]
  }

  /** Checks the api key and validates the request like city account, a malformed request gets 400. */
  private handleIntegration<T>(
    request: Request,
    endpoint: CityAccountEndpoint,
    input: unknown,
    schema: z.ZodType<T>,
    respond: (data: T) => MockResponse,
  ): nock.ReplyFnResult {
    return this.handle(endpoint, input, () => {
      if (request.headers.get('apikey') !== this.adminApiKey) {
        return errorResponse(
          HttpStatus.UNAUTHORIZED,
          CityAccountMockErrorName.InvalidApiKey,
          'Invalid api key',
        )
      }
      const result = schema.safeParse(input)
      return result.success
        ? respond(result.data)
        : errorResponse(
            HttpStatus.BAD_REQUEST,
            CityAccountMockErrorName.ValidationFailed,
            z.prettifyError(result.error),
          )
    })
  }

  private upsertUser(authorization: string | null): MockResponse {
    const user = this.users.find(
      ({ fixtureUser }) => fixtureUser.headers.Authorization === authorization,
    )
    return user
      ? { status: HttpStatus.OK, body: user.fixtureUser.cityAccountUser }
      : errorResponse(
          HttpStatus.UNAUTHORIZED,
          CityAccountMockErrorName.InvalidToken,
          'Unauthorized',
        )
  }

  /** Same paging as `UserService.getNewVerifiedUsersBirthNumbers` in nest-city-account. */
  private getNewVerifiedUsers({
    since: sinceDate,
    take,
  }: z.infer<
    typeof newVerifiedUsersBodySchema
  >): GetNewVerifiedUsersBirthNumbersResponseDto {
    const limitedTake =
      Math.min(take ?? USER_REQUEST_LIMIT, USER_REQUEST_LIMIT) + 1
    // Only verified users (with a birth number) are returned
    const users = this.users
      .flatMap(({ fixtureUser, verifiedAt }) => {
        const { birthNumber } = fixtureUser.cityAccountUser
        return birthNumber && verifiedAt >= sinceDate
          ? [{ birthNumber, verifiedAt }]
          : []
      })
      .sort((a, b) => a.verifiedAt.getTime() - b.verifiedAt.getTime())
      .slice(0, limitedTake)

    let nextSince = sinceDate
    if (users.length > 0) {
      const lastVerifiedAt = users[users.length - 1].verifiedAt
      if (users.length < limitedTake) {
        nextSince = new Date(lastVerifiedAt.getTime() + 1)
      } else {
        nextSince = lastVerifiedAt
        users.pop()
      }
    }

    return {
      birthNumbers: users.map((user) => user.birthNumber),
      nextSince: nextSince.toISOString(),
    }
  }

  private findByBirthNumber(birthNumber: string) {
    return this.users.find(
      (user) => user.fixtureUser.cityAccountUser.birthNumber === birthNumber,
    )
  }

  private static toUserByBirthNumber(
    user: CityAccountMockUser,
  ): ResponseUserByBirthNumberDto {
    const { cityAccountUser } = user.fixtureUser
    return {
      birthNumber: cityAccountUser.birthNumber,
      email: cityAccountUser.email,
      externalId: cityAccountUser.externalId,
      userAttribute: {},
      cognitoAttributes: {},
      taxDeliveryMethodAtLockDate: user.taxDeliveryMethodAtLockDate,
    }
  }
}
