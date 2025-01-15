import { HttpException, HttpStatus } from '@nestjs/common'

import alertReporting from '../constants/error.alerts'
import { LineLoggerSubservice } from '../subservices/line-logger.subservice'
import {
  CustomErrorEnums,
  ErrorSymbols,
  ResponseErrorDto,
} from './dtos/error.dto'

export default class ThrowerErrorGuard {
  private logger: LineLoggerSubservice = new LineLoggerSubservice('Error Guard')

  NotAcceptableException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_ACCEPTABLE,
      'Resource was not accepted.',
      errorEnum,
      message,
      console,
      object,
    )
  }

  GoneException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.GONE,
      'Resource is gone.',
      errorEnum,
      message,
      console,
      object,
    )
  }

  PayloadTooLargeException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.PAYLOAD_TOO_LARGE,
      'Payload to large.',
      errorEnum,
      message,
      console,
      object,
    )
  }

  InternalServerErrorException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
      errorEnum,
      message,
      console,
      object,
    )
  }

  ForbiddenException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.FORBIDDEN,
      'Forbidden',
      errorEnum,
      message,
      console,
      object,
    )
  }

  UnprocessableEntityException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.UNPROCESSABLE_ENTITY,
      'Unprocessable entity',
      errorEnum,
      message,
      console,
      object,
    )
  }

  NotFoundException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_FOUND,
      'Not found',
      errorEnum,
      message,
      console,
      object,
    )
  }

  BadRequestException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      errorEnum,
      message,
      console,
      object,
    )
  }

  UnauthorizedException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      errorEnum,
      message,
      console,
      object,
    )
  }

  private LoggingHttpException(
    statusCode: number,
    status: string,
    errorsEnum: CustomErrorEnums,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    const response: ResponseErrorDto = {
      statusCode,
      status,
      errorName: errorsEnum,
      [ErrorSymbols.alert]: 0,
      message,
      object,
      [ErrorSymbols.console]: console,
    }

    if (alertReporting.includes(errorsEnum)) {
      response[ErrorSymbols.alert] = 1
    }
    return new HttpException(response, statusCode)
  }
}
