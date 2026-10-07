import { ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import axios from 'axios'
import type { Mocked } from 'vitest'

import { expectAny, expectObjectContaining } from '../../__tests__/matchers'
import BaConfigService from '../../config/ba-config.service'
import alertReporting from '../../utils/constants/error.alerts'
import { TowingErrorsEnum, TowingErrorsResponseEnum } from '../towing.errors.enum'
import { TowingService } from '../towing.service'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

const ENFORCEMENT_BACKEND_URL = 'https://nest-enforcement-backend.test'
const ENFORCEMENT_BACKEND_TOW_API_KEY = 'tow-api-key-test'

const towUrl = (encodedEcv: string) => `${ENFORCEMENT_BACKEND_URL}/api/public/tow/${encodedEcv}`

/**
 * Build a plain object that satisfies axios's `isAxiosError` predicate
 * (it only checks for `error.isAxiosError === true`). Avoids depending on
 * the real AxiosError class, which auto-mocking would replace.
 */
type MockAxiosError = Error & {
  isAxiosError: boolean
  code?: string
  response?: { status: number }
}

const makeAxiosError = (status?: number, code?: string): MockAxiosError => {
  const error = new Error('mock-axios-error') as MockAxiosError
  error.isAxiosError = true
  error.code = code
  if (status !== undefined) {
    error.response = { status }
  }
  return error
}

describe('TowingService', () => {
  let service: TowingService
  let errorFactoryService: ErrorFactoryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TowingService,
        { provide: ErrorFactoryService, useValue: new ErrorFactoryService({ alertReporting }) },
        {
          provide: BaConfigService,
          useValue: {
            enforcement: {
              backendUrl: ENFORCEMENT_BACKEND_URL,
              towApiKey: ENFORCEMENT_BACKEND_TOW_API_KEY,
            },
          },
        },
      ],
    }).compile()

    service = module.get<TowingService>(TowingService)
    errorFactoryService = module.get(ErrorFactoryService)
    mockedAxios.isAxiosError.mockImplementation(
      (value: unknown): value is never =>
        typeof value === 'object' &&
        value !== null &&
        (value as { isAxiosError?: unknown }).isAxiosError === true
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getPublicTowingByEcv', () => {
    it('returns the upstream payload on success and uses the configured base URL', async () => {
      const payload = {
        loadingDate: '2024-05-01T08:00:00Z',
        loadingLocation: 'Hviezdoslavovo nam.',
      }
      mockedAxios.get.mockResolvedValueOnce({ data: payload })

      const result = await service.getPublicTowingByEcv('BA123AB')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${ENFORCEMENT_BACKEND_URL}/api/public/tow/BA123AB`,
        expectObjectContaining({
          timeout: expectAny<number>(Number),
          headers: {
            'X-Api-Key': ENFORCEMENT_BACKEND_TOW_API_KEY,
          },
        })
      )
      expect(result).toEqual(payload)
    })

    it('url-encodes the ecv parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} })
      await service.getPublicTowingByEcv('BA 123')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${ENFORCEMENT_BACKEND_URL}/api/public/tow/BA%20123`,
        expectObjectContaining({
          headers: {
            'X-Api-Key': ENFORCEMENT_BACKEND_TOW_API_KEY,
          },
        })
      )
    })

    it('maps a 404 response to NotFoundException with TOWING_NOT_FOUND', async () => {
      const axiosError = makeAxiosError(HttpStatus.NOT_FOUND)
      mockedAxios.get.mockRejectedValueOnce(axiosError)

      // fromAxiosError's status overrides use node's reason phrase ("Not Found") as the
      // response status, unlike NotFoundException ("Not found"), so the whole error
      // cannot be built with a public factory method.
      await expect(service.getPublicTowingByEcv('BA000XX')).rejects.toThrow(
        expectObjectContaining<{ status: number; response: object }>({
          status: HttpStatus.NOT_FOUND,
          response: expectObjectContaining({
            statusCode: HttpStatus.NOT_FOUND,
            errorName: TowingErrorsEnum.TOWING_NOT_FOUND,
            message: TowingErrorsResponseEnum.TOWING_NOT_FOUND,
          }),
        })
      )
    })

    it('forwards a 400 from upstream as BadRequest with ENFORCEMENT_BACKEND_REJECTED_REQUEST', async () => {
      const ecv = '!!'
      const axiosError = makeAxiosError(HttpStatus.BAD_REQUEST)
      mockedAxios.get.mockRejectedValueOnce(axiosError)

      await expect(service.getPublicTowingByEcv(ecv)).rejects.toThrow(
        errorFactoryService.BadRequestException({
          errorEnum: TowingErrorsEnum.ENFORCEMENT_BACKEND_REJECTED_REQUEST,
          message: TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_REJECTED_REQUEST,
          console: {
            ecv,
            url: towUrl(ecv),
            status: HttpStatus.BAD_REQUEST,
          },
          error: axiosError,
        })
      )
    })

    it('maps a network error (no response) to 503 ENFORCEMENT_BACKEND_UNAVAILABLE', async () => {
      const ecv = 'BA123AB'
      const axiosError = makeAxiosError(undefined, 'ECONNREFUSED')
      mockedAxios.get.mockRejectedValueOnce(axiosError)

      await expect(service.getPublicTowingByEcv(ecv)).rejects.toThrow(
        errorFactoryService.ServiceUnavailableException({
          errorEnum: TowingErrorsEnum.ENFORCEMENT_BACKEND_UNAVAILABLE,
          message: TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_UNAVAILABLE,
          console: { ecv, url: towUrl(ecv), code: axiosError.code },
          error: axiosError,
        })
      )
    })

    it('maps upstream 503 to 503 ENFORCEMENT_BACKEND_UNAVAILABLE', async () => {
      mockedAxios.get.mockRejectedValueOnce(makeAxiosError(HttpStatus.SERVICE_UNAVAILABLE))

      // See the 404 case on why this is not a whole-object comparison.
      await expect(service.getPublicTowingByEcv('BA123AB')).rejects.toThrow(
        expectObjectContaining<{ status: number; response: object }>({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          response: expectObjectContaining({
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            errorName: TowingErrorsEnum.ENFORCEMENT_BACKEND_UNAVAILABLE,
            message: TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_UNAVAILABLE,
          }),
        })
      )
    })

    it.each([
      ['401', HttpStatus.UNAUTHORIZED],
      ['403', HttpStatus.FORBIDDEN],
    ] as const)(
      'maps downstream auth error %s to 502 BAD_GATEWAY_AUTH_ERROR',
      async (_label, status) => {
        const ecv = 'BA123AB'
        const axiosError = makeAxiosError(status)
        mockedAxios.get.mockRejectedValueOnce(axiosError)

        await expect(service.getPublicTowingByEcv(ecv)).rejects.toThrow(
          errorFactoryService.BadGatewayException({
            errorEnum: ErrorEnum.BAD_GATEWAY_AUTH_ERROR,
            message: TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE,
            console: { ecv, url: towUrl(ecv), status },
            error: axiosError,
          })
        )
      }
    )

    it.each([
      ['5xx', HttpStatus.BAD_GATEWAY],
      ['unhandled 4xx', HttpStatus.I_AM_A_TEAPOT],
      ['unhandled 3xx', HttpStatus.MOVED_PERMANENTLY],
    ])('maps an unexpected upstream %s to 502 BAD_GATEWAY_ERROR', async (_label, status) => {
      const ecv = 'BA123AB'
      const axiosError = makeAxiosError(status)
      mockedAxios.get.mockRejectedValueOnce(axiosError)

      await expect(service.getPublicTowingByEcv(ecv)).rejects.toThrow(
        errorFactoryService.BadGatewayException({
          errorEnum: ErrorEnum.BAD_GATEWAY_ERROR,
          message: TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE,
          console: { ecv, url: towUrl(ecv), status },
          error: axiosError,
        })
      )
    })
  })
})
