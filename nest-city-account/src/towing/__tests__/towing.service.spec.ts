import { HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import axios from 'axios'

import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { TowingErrorsEnum } from '../towing.errors.enum'
import { TowingService } from '../towing.service'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const ENFORCEMENT_BACKEND_URL = 'https://nest-enforcement-backend.test'

/**
 * Build a plain object that satisfies axios's `isAxiosError` predicate
 * (it only checks for `error.isAxiosError === true`). Avoids depending on
 * the real AxiosError class, which auto-mocking would replace.
 */
const makeAxiosError = (status?: number, code?: string): Error => {
  const error = new Error('mock-axios-error') as Error & {
    isAxiosError: boolean
    code?: string
    response?: { status: number }
  }
  error.isAxiosError = true
  error.code = code
  if (status !== undefined) {
    error.response = { status }
  }
  return error
}

describe('TowingService', () => {
  let service: TowingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TowingService,
        ThrowerErrorGuard,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(ENFORCEMENT_BACKEND_URL),
          },
        },
      ],
    }).compile()

    service = module.get<TowingService>(TowingService)
    mockedAxios.isAxiosError.mockImplementation(
      (value: unknown): value is never =>
        typeof value === 'object' &&
        value !== null &&
        (value as { isAxiosError?: unknown }).isAxiosError === true
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
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
        expect.objectContaining({ timeout: expect.any(Number) })
      )
      expect(result).toEqual(payload)
    })

    it('url-encodes the ecv parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} })
      await service.getPublicTowingByEcv('BA 123')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${ENFORCEMENT_BACKEND_URL}/api/public/tow/BA%20123`,
        expect.any(Object)
      )
    })

    it('maps a 404 response to NotFoundException with TOWING_NOT_FOUND', async () => {
      mockedAxios.get.mockRejectedValueOnce(makeAxiosError(HttpStatus.NOT_FOUND))

      try {
        await service.getPublicTowingByEcv('BA000XX')
        fail('expected to throw')
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        const httpError = error as HttpException
        expect(httpError.getStatus()).toBe(HttpStatus.NOT_FOUND)
        expect((httpError.getResponse() as { errorName: string }).errorName).toBe(
          TowingErrorsEnum.TOWING_NOT_FOUND
        )
      }
    })

    it('forwards a 400 from upstream as BadRequest with ENFORCEMENT_BACKEND_REJECTED_REQUEST', async () => {
      mockedAxios.get.mockRejectedValueOnce(makeAxiosError(HttpStatus.BAD_REQUEST))

      try {
        await service.getPublicTowingByEcv('!!')
        fail('expected to throw')
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        const httpError = error as HttpException
        expect(httpError.getStatus()).toBe(HttpStatus.BAD_REQUEST)
        expect((httpError.getResponse() as { errorName: string }).errorName).toBe(
          TowingErrorsEnum.ENFORCEMENT_BACKEND_REJECTED_REQUEST
        )
      }
    })

    it('maps a network error (no response) to 503 ENFORCEMENT_BACKEND_UNAVAILABLE', async () => {
      mockedAxios.get.mockRejectedValueOnce(makeAxiosError(undefined, 'ECONNREFUSED'))

      try {
        await service.getPublicTowingByEcv('BA123AB')
        fail('expected to throw')
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        const httpError = error as HttpException
        expect(httpError.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE)
        expect((httpError.getResponse() as { errorName: string }).errorName).toBe(
          TowingErrorsEnum.ENFORCEMENT_BACKEND_UNAVAILABLE
        )
      }
    })

    it.each([
      ['5xx', HttpStatus.BAD_GATEWAY],
      ['unhandled 4xx', HttpStatus.I_AM_A_TEAPOT],
      ['unhandled 3xx', HttpStatus.MOVED_PERMANENTLY],
    ])(
      'maps an unexpected upstream %s to 502 ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE',
      async (_label, status) => {
        mockedAxios.get.mockRejectedValueOnce(makeAxiosError(status))

        try {
          await service.getPublicTowingByEcv('BA123AB')
          fail('expected to throw')
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException)
          const httpError = error as HttpException
          expect(httpError.getStatus()).toBe(HttpStatus.BAD_GATEWAY)
          expect((httpError.getResponse() as { errorName: string }).errorName).toBe(
            TowingErrorsEnum.ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE
          )
        }
      }
    )
  })
})
