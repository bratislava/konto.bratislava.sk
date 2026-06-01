import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import alertReporting from '../constants/error.alerts'
import {
  CustomErrorEnums,
  ErrorsEnum,
  ErrorsResponseEnum,
  ErrorSymbols,
  ResponseErrorInternalDto,
} from './dtos/error.dto'
import { AxiosError } from 'axios'
import { STATUS_CODES } from 'node:http'

/**
 * A single per-status entry for {@link FromAxiosErrorOptions.statusOverrides}.
 *
 * @param status HttpStatus
 * @param errorEnum stored as `errorName` on the produced exception. Drives
 *        alerting via {@link alertReporting}).
 * @param message human-readable text on the exception's `message` field.
 */
export type StatusOverride = {
  status: number
  errorEnum: CustomErrorEnums
  message: string
}

/**
 * Options for {@link ThrowerErrorGuard.fromAxiosError}.
 *
 * @param message human-readable text on the produced exception's `message`
 *        field. Applies to all statuses except overridden ones.
 * @param errorEnumOverwrite replaces the default `errorEnum` on the default
 *        branches ({@link ThrowerErrorGuard.BadGatewayException} / {@link
 *        ThrowerErrorGuard.ServiceUnavailableException}). Ignored on the
 *        statusOverrides path.
 * @param console  extra context attached to the log entry only and stripped
 *        from the client response.
 * @param statusOverrides per-status overrides; override a specific downstream
 *        status with custom status, errorEnum, and message. See {@link
 *        StatusOverride}.
 */
export type FromAxiosErrorOptions = {
  message?: string
  errorEnumOverwrite?: CustomErrorEnums
  console?: string
  statusOverrides?: Record<number, StatusOverride>
}

@Injectable()
export default class ThrowerErrorGuard {
  NotAcceptableException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_ACCEPTABLE,
      'Resource was not accepted.',
      errorEnum,
      message,
      console,
      error
    )
  }

  GoneException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.GONE,
      'Resource is gone.',
      errorEnum,
      message,
      console,
      error
    )
  }

  PayloadTooLargeException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.PAYLOAD_TOO_LARGE,
      'Payload to large.',
      errorEnum,
      message,
      console,
      error
    )
  }

  InternalServerErrorException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
      errorEnum,
      message,
      console,
      error
    )
  }

  BadGatewayException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.BAD_GATEWAY,
      'Bad gateway',
      errorEnum,
      message,
      console,
      error
    )
  }

  ServiceUnavailableException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service unavailable',
      errorEnum,
      message,
      console,
      error
    )
  }

  ForbiddenException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.FORBIDDEN,
      'Forbidden',
      errorEnum,
      message,
      console,
      error
    )
  }

  UnprocessableEntityException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.UNPROCESSABLE_ENTITY,
      'Unprocessable entity',
      errorEnum,
      message,
      console,
      error
    )
  }

  NotFoundException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_FOUND,
      'Not found',
      errorEnum,
      message,
      console,
      error
    )
  }

  BadRequestException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      errorEnum,
      message,
      console,
      error
    )
  }

  UnauthorizedException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: unknown
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      errorEnum,
      message,
      console,
      error
    )
  }

  /**
   * Maps an `AxiosError` to an `HttpException`, picking the variant
   * from the downstream response:
   * - status included in opts.statusOverrides -> custom status, errorEnum, and
   *     message from the override entry
   * - `503` with `Retry-After` -> {@link ServiceUnavailableException}
   * - `401` / `403` -> {@link BadGatewayException} with
   *     `ErrorsEnum.BAD_GATEWAY_AUTH_ERROR`
   * - anything else -> {@link BadGatewayException} with
   *     `ErrorsEnum.BAD_GATEWAY_ERROR`
   *
   * `ErrorsEnum.BAD_GATEWAY_AUTH_ERROR` must be listed in {@link alertReporting}
   * so misconfigured credentials/secrets alert instead of failing silently.
   * `ErrorsEnum.SERVICE_UNAVAILABLE_ERROR` and `ErrorsEnum.BAD_GATEWAY_ERROR`
   * should not be alerted.
   *
   * @param error the processed AxiosError
   * @param options for overriding message and errorEnum. Adds an option to
   * write a console message. `options: overrides` allows for custom
   * response based on `AxiosError.response.status` (for more see
   * {@link FromAxiosErrorOptions.statusOverrides})
   */
  fromAxiosError(error: AxiosError, options: FromAxiosErrorOptions): HttpException {
    const { message, console, errorEnumOverwrite, statusOverrides } = options
    const status = error.response?.status
    const override = status !== undefined ? statusOverrides?.[status] : undefined

    if (override !== undefined) {
      const overrideStatus = override.status ?? status
      return this.LoggingHttpException(
        overrideStatus,
        STATUS_CODES[overrideStatus] ?? message ?? '',
        override.errorEnum,
        override.message,
        console,
        error
      )
    }

    if (status === HttpStatus.SERVICE_UNAVAILABLE && error.response?.headers['retry-after']) {
      return this.ServiceUnavailableException(
        errorEnumOverwrite ?? ErrorsEnum.SERVICE_UNAVAILABLE_ERROR,
        message ?? ErrorsResponseEnum.SERVICE_UNAVAILABLE_ERROR,
        console,
        error
      )
    }

    // 401/403 from the downstream means our credentials are wrong/expired — the
    // request is never going to succeed without direct intervention, so alert
    // by default.
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      return this.BadGatewayException(
        errorEnumOverwrite ?? ErrorsEnum.BAD_GATEWAY_AUTH_ERROR,
        message ?? ErrorsResponseEnum.BAD_GATEWAY_AUTH_ERROR,
        console,
        error
      )
    }

    return this.BadGatewayException(
      errorEnumOverwrite ?? ErrorsEnum.BAD_GATEWAY_ERROR,
      message ?? ErrorsResponseEnum.BAD_GATEWAY_ERROR,
      console,
      error
    )
  }

  private LoggingHttpException(
    statusCode: number,
    status: string,
    errorsEnum: CustomErrorEnums,
    message: string,
    console?: string,
    errorCause?: unknown
  ): HttpException {
    const response: ResponseErrorInternalDto =
      errorCause instanceof Error
        ? {
            statusCode,
            status,
            errorName: errorsEnum,
            [ErrorSymbols.alert]: 0,
            message,
            [ErrorSymbols.errorCause]: errorCause.name,
            [ErrorSymbols.causedByMessage]: errorCause.message,
            [ErrorSymbols.console]: console,
          }
        : {
            statusCode,
            status,
            errorName: errorsEnum,
            [ErrorSymbols.alert]: 0,
            message,
            [ErrorSymbols.errorCause]: errorCause ? typeof errorCause : undefined,
            [ErrorSymbols.causedByMessage]: errorCause ? JSON.stringify(errorCause) : undefined,
            [ErrorSymbols.console]: console,
          }

    if (alertReporting.includes(errorsEnum)) {
      response[ErrorSymbols.alert] = 1
    }
    const exception = new HttpException(response, statusCode)

    if (errorCause && errorCause instanceof Error && errorCause.stack) {
      exception.stack = [exception.stack, 'Was directly caused by:\n', errorCause.stack].join('\n')
    }

    return exception
  }
}
