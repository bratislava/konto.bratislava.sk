import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios'

import { ErrorsEnum, ErrorsResponseEnum } from '../../global-enums/errors.enum'
import { ErrorSymbols, ResponseErrorInternalDto } from '../dtos/error.dto'
import ThrowerErrorGuard from '../thrower-error.guard'

describe('ThrowerErrorGuard', () => {
  let guard: ThrowerErrorGuard

  beforeEach(async () => {
    jest.resetAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [ThrowerErrorGuard],
    }).compile()

    guard = app.get<ThrowerErrorGuard>(ThrowerErrorGuard)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  describe('alerting', () => {
    it('should alert', () => {
      const result = guard
        .BadRequestException(ErrorsEnum.DATABASE_ERROR, 'Some message')
        .getResponse() as ResponseErrorInternalDto

      expect(result[ErrorSymbols.alert]).toBe(1)
    })

    it('should not alert', () => {
      const result = guard
        .BadRequestException(ErrorsEnum.NOT_FOUND_ERROR, 'Some message')
        .getResponse() as ResponseErrorInternalDto

      expect(result[ErrorSymbols.alert]).toBe(0)
    })
  })

  describe('fromAxiosError', () => {
    // `fromAxiosError` only reads `response.status` and `response.headers`; everything
    // else is filler to keep the AxiosError shape honest for the type system.
    const createMockAxiosError = ({
      status,
      headers = {},
    }: {
      status?: number
      headers?: Record<string, string>
    } = {}): AxiosError => {
      const config: InternalAxiosRequestConfig = {
        url: 'https://downstream.example.com/resource',
        method: 'get',
        headers: new AxiosHeaders({ Accept: 'application/json' }),
      }

      const response =
        status === undefined
          ? undefined
          : {
              status,
              statusText: '',
              headers,
              config,
              data: undefined,
            }

      return new AxiosError(
        status === undefined
          ? 'Network Error'
          : `Request failed with status code ${status}`,
        status === undefined ? 'ERR_NETWORK' : 'ERR_BAD_RESPONSE',
        config,
        undefined,
        response,
      )
    }

    describe('statusOverrides branch', () => {
      it('maps the downstream status to override status/errorEnum/message', () => {
        const error = createMockAxiosError({ status: HttpStatus.NOT_FOUND })

        const result = guard.fromAxiosError(error, {
          statusOverrides: {
            404: {
              status: HttpStatus.NOT_FOUND,
              errorEnum: ErrorsEnum.NOT_FOUND_ERROR,
              message: 'Downstream resource missing',
            },
          },
        })

        expect(result.getStatus()).toBe(HttpStatus.NOT_FOUND)
        const response = result.getResponse() as ResponseErrorInternalDto
        expect(response.errorName).toBe(ErrorsEnum.NOT_FOUND_ERROR)
        expect(response.message).toBe('Downstream resource missing')
        expect(response.status).toBe('Not Found')
      })

      it('takes precedence over the 503 + retry-after branch', () => {
        const error = createMockAxiosError({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          headers: { 'retry-after': '30' },
        })

        const result = guard.fromAxiosError(error, {
          statusOverrides: {
            [HttpStatus.SERVICE_UNAVAILABLE]: {
              status: HttpStatus.BAD_REQUEST,
              errorEnum: ErrorsEnum.BAD_REQUEST_ERROR,
              message: 'Override wins',
            },
          },
        })

        expect(result.getStatus()).toBe(HttpStatus.BAD_REQUEST)
        const response = result.getResponse() as ResponseErrorInternalDto
        expect(response.errorName).toBe(ErrorsEnum.BAD_REQUEST_ERROR)
        expect(response.message).toBe('Override wins')
      })

      it('ignores options.errorEnumOverwrite and options.message on the override path', () => {
        const error = createMockAxiosError({ status: 500 })

        const response = guard
          .fromAxiosError(error, {
            message: 'top-level message',
            errorEnumOverwrite: ErrorsEnum.DATABASE_ERROR,
            statusOverrides: {
              500: {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                errorEnum: ErrorsEnum.INTERNAL_SERVER_ERROR,
                message: 'override message',
              },
            },
          })
          .getResponse() as ResponseErrorInternalDto

        expect(response.message).toBe('override message')
        expect(response.errorName).toBe(ErrorsEnum.INTERNAL_SERVER_ERROR)
      })

      it('falls through when the downstream status does not match any override entry', () => {
        const error = createMockAxiosError({ status: 500 })

        const result = guard.fromAxiosError(error, {
          statusOverrides: {
            404: {
              status: HttpStatus.NOT_FOUND,
              errorEnum: ErrorsEnum.NOT_FOUND_ERROR,
              message: 'not used',
            },
          },
        })

        expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY)
        const response = result.getResponse() as ResponseErrorInternalDto
        expect(response.errorName).toBe(ErrorsEnum.BAD_GATEWAY_ERROR)
      })

      it('falls back to options.message for status text when STATUS_CODES has no entry', () => {
        const error = createMockAxiosError({ status: 599 })

        const response = guard
          .fromAxiosError(error, {
            message: 'fallback status text',
            statusOverrides: {
              599: {
                status: 599,
                errorEnum: ErrorsEnum.BAD_GATEWAY_ERROR,
                message: 'override message',
              },
            },
          })
          .getResponse() as ResponseErrorInternalDto

        expect(response.status).toBe('fallback status text')
        expect(response.message).toBe('override message')
      })
    })

    describe('503 + retry-after branch', () => {
      it('returns ServiceUnavailable with default enum and message', () => {
        const error = createMockAxiosError({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          headers: { 'retry-after': '30' },
        })

        const result = guard.fromAxiosError(error, {})

        expect(result.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE)
        const response = result.getResponse() as ResponseErrorInternalDto
        expect(response.errorName).toBe(ErrorsEnum.SERVICE_UNAVAILABLE_ERROR)
        expect(response.message).toBe(
          ErrorsResponseEnum.SERVICE_UNAVAILABLE_ERROR,
        )
        expect(response[ErrorSymbols.alert]).toBe(0)
      })

      it('falls through to the default branch when retry-after header is absent', () => {
        const error = createMockAxiosError({
          status: HttpStatus.SERVICE_UNAVAILABLE,
        })

        const result = guard.fromAxiosError(error, {})

        expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY)
        const response = result.getResponse() as ResponseErrorInternalDto
        expect(response.errorName).toBe(ErrorsEnum.BAD_GATEWAY_ERROR)
      })
    })

    describe('401/403 branch', () => {
      it.each([
        ['401', HttpStatus.UNAUTHORIZED],
        ['403', HttpStatus.FORBIDDEN],
      ] as const)(
        'maps %s to BadGateway with BAD_GATEWAY_AUTH_ERROR and alerts',
        (_, status) => {
          const error = createMockAxiosError({ status })

          const result = guard.fromAxiosError(error, {})

          expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY)
          const response = result.getResponse() as ResponseErrorInternalDto
          expect(response.errorName).toBe(ErrorsEnum.BAD_GATEWAY_AUTH_ERROR)
          expect(response.message).toBe(
            ErrorsResponseEnum.BAD_GATEWAY_AUTH_ERROR,
          )
          expect(response[ErrorSymbols.alert]).toBe(1)
        },
      )
    })

    describe('default branch', () => {
      it('maps an unhandled downstream status to BadGateway with BAD_GATEWAY_ERROR', () => {
        const error = createMockAxiosError({ status: 500 })

        const result = guard.fromAxiosError(error, {})

        expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY)
        const response = result.getResponse() as ResponseErrorInternalDto
        expect(response.errorName).toBe(ErrorsEnum.BAD_GATEWAY_ERROR)
        expect(response.message).toBe(ErrorsResponseEnum.BAD_GATEWAY_ERROR)
        expect(response[ErrorSymbols.alert]).toBe(0)
      })

      it('handles a network error (no response on the AxiosError)', () => {
        const error = createMockAxiosError()

        const result = guard.fromAxiosError(error, {})

        expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY)
        const response = result.getResponse() as ResponseErrorInternalDto
        expect(response.errorName).toBe(ErrorsEnum.BAD_GATEWAY_ERROR)
      })

      it('honours errorEnumOverwrite and options.message', () => {
        const error = createMockAxiosError({ status: 500 })

        const response = guard
          .fromAxiosError(error, {
            errorEnumOverwrite: ErrorsEnum.DATABASE_ERROR,
            message: 'something else',
          })
          .getResponse() as ResponseErrorInternalDto

        expect(response.errorName).toBe(ErrorsEnum.DATABASE_ERROR)
        expect(response.message).toBe('something else')
        expect(response[ErrorSymbols.alert]).toBe(1)
      })
    })
  })
})
