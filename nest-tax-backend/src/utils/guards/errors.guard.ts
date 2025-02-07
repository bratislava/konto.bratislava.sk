import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import alertReporting from '../constants/error.alerts'
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
    status?: string,
    console?: string,
    error?: Error,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_ACCEPTABLE,
      status || 'Resource was not accepted.',
      errorEnum,
      message,
      console,
      error,
    )
  }

  GoneException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    error?: Error,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.GONE,
      status || 'Resource is gone.',
      errorEnum,
      message,
      console,
      error,
    )
  }

  PayloadTooLargeException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    error?: Error,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.PAYLOAD_TOO_LARGE,
      status || 'Payload to large.',
      errorEnum,
      message,
      console,
      error,
    )
  }

  InternalServerErrorException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    error?: Error,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      status || 'Internal server error',
      errorEnum,
      message,
      console,
      error,
    )
  }

  ForbiddenException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    error?: Error,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.FORBIDDEN,
      status || 'Forbidden',
      errorEnum,
      message,
      console,
      error,
    )
  }

  UnprocessableEntityException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    error?: Error,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.UNPROCESSABLE_ENTITY,
      status || 'Unprocessable entity',
      errorEnum,
      message,
      console,
      error,
    )
  }

  NotFoundException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    error?: Error,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_FOUND,
      status || 'Not found',
      errorEnum,
      message,
      console,
      error,
    )
  }

  BadRequestException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    error?: Error,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.BAD_REQUEST,
      status || 'Bad Request',
      errorEnum,
      message,
      console,
      error,
    )
  }

  UnauthorizedException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    error?: Error,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.UNAUTHORIZED,
      status || 'Unauthorized',
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
    console?: string,
    errorCause?: Error,
  ): HttpException {
    const response: ResponseErrorInternalDto = {
      statusCode,
      status,
      errorName: errorsEnum,
      [ErrorSymbols.alert]: 0,
      message,
      [ErrorSymbols.errorCause]: errorCause?.name,
      [ErrorSymbols.causedByMessage]: errorCause?.message,
      [ErrorSymbols.console]: console,
    }

    if (alertReporting.includes(errorsEnum)) {
      response[ErrorSymbols.alert] = 1
    }
    const exception = new HttpException(response, statusCode)

    if (errorCause && errorCause.stack) {
      exception.stack = [
        exception.stack,
        'Was directly caused by:\n',
        errorCause.stack,
      ].join('\n')
    }

    return exception
  }
}
