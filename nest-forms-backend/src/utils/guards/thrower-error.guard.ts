import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import alertReporting from '../constants/error.alerts'
import { toLogfmt } from '../logging'
import {
  CustomErrorEnums,
  ErrorSymbols,
  ResponseErrorInternalDto,
} from './dtos/error.dto'

@Injectable()
export default class ThrowerErrorGuard {
  NotAcceptableException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string | Record<string, unknown>,
    error?: Error | unknown,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_ACCEPTABLE,
      'Resource was not accepted.',
      errorEnum,
      message,
      console,
      error,
    )
  }

  GoneException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string | Record<string, unknown>,
    error?: Error | unknown,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.GONE,
      'Resource is gone.',
      errorEnum,
      message,
      console,
      error,
    )
  }

  PayloadTooLargeException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string | Record<string, unknown>,
    error?: Error | unknown,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.PAYLOAD_TOO_LARGE,
      'Payload to large.',
      errorEnum,
      message,
      console,
      error,
    )
  }

  InternalServerErrorException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string | Record<string, unknown>,
    error?: Error | unknown,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
      errorEnum,
      message,
      console,
      error,
    )
  }

  ForbiddenException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string | Record<string, unknown>,
    error?: Error | unknown,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.FORBIDDEN,
      'Forbidden',
      errorEnum,
      message,
      console,
      error,
    )
  }

  UnprocessableEntityException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string | Record<string, unknown>,
    error?: Error | unknown,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.UNPROCESSABLE_ENTITY,
      'Unprocessable entity',
      errorEnum,
      message,
      console,
      error,
    )
  }

  NotFoundException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string | Record<string, unknown>,
    error?: Error | unknown,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_FOUND,
      'Not found',
      errorEnum,
      message,
      console,
      error,
    )
  }

  BadRequestException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string | Record<string, unknown>,
    error?: Error | unknown,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      errorEnum,
      message,
      console,
      error,
    )
  }

  UnauthorizedException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string | Record<string, unknown>,
    error?: Error | unknown,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      errorEnum,
      message,
      console,
      error,
    )
  }

  private LoggingHttpException(
    statusCode: number,
    status: string,
    errorsEnum: CustomErrorEnums,
    message: string,
    console?: string | Record<string, unknown>,
    errorCause?: unknown,
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
            [ErrorSymbols.causedByConsole]:
              errorCause instanceof HttpException
                ? (errorCause.getResponse() as ResponseErrorInternalDto)[
                    ErrorSymbols.console
                  ]
                : undefined,
            [ErrorSymbols.console]: console,
          }
        : {
            statusCode,
            status,
            errorName: errorsEnum,
            [ErrorSymbols.alert]: 0,
            message,
            [ErrorSymbols.errorCause]: errorCause
              ? typeof errorCause
              : undefined,
            [ErrorSymbols.causedByMessage]: errorCause
              ? JSON.stringify(errorCause)
              : undefined,
            [ErrorSymbols.console]: console,
          }

    if (alertReporting.includes(errorsEnum)) {
      response[ErrorSymbols.alert] = 1
    }
    const exception = new HttpException(response, statusCode)

    if (errorCause && errorCause instanceof Error && errorCause.stack) {
      exception.stack = [
        exception.stack,
        'Was directly caused by:\n',
        errorCause.stack,
      ].join('\n')
    }

    return exception
  }
}
