import { HttpException, HttpStatus, Logger } from '@nestjs/common'

import alertReporting from '../constants/error.alerts'

export default class ThrowerErrorGuard {
  private logger: Logger = new Logger('Error Guard')

  NotAcceptableException(
    errorEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.HttpException(
      406,
      'Resource was not accepted.',
      errorEnum,
      message,
      console,
      object,
    )
  }

  GoneException(
    errorEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.HttpException(
      410,
      'Resource is gone.',
      errorEnum,
      message,
      console,
      object,
    )
  }

  PayloadTooLargeException(
    errorEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.HttpException(
      413,
      'Payload to large.',
      errorEnum,
      message,
      console,
      object,
    )
  }

  InternalServerErrorException(
    errorEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.HttpException(
      500,
      'Internal server error',
      errorEnum,
      message,
      console,
      object,
    )
  }

  ServiceUnavailableException(
    errorEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.HttpException(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service unavailable',
      errorEnum,
      message,
      console,
      object,
    )
  }

  ForbiddenException(
    errorEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.HttpException(
      HttpStatus.FORBIDDEN,
      'Forbidden',
      errorEnum,
      message,
      console,
      object,
    )
  }

  UnprocessableEntityException(
    errorEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.HttpException(
      422,
      'Unprocessable entity',
      errorEnum,
      message,
      console,
      object,
    )
  }

  NotFoundException(
    errorEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.HttpException(
      404,
      'Not found',
      errorEnum,
      message,
      console,
      object,
    )
  }

  BadRequestException(
    errorEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.HttpException(
      400,
      'Bad Request',
      errorEnum,
      message,
      console,
      object,
    )
  }

  UnauthorizedException(
    errorEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.HttpException(
      401,
      'Unauthorized',
      errorEnum,
      message,
      console,
      object,
    )
  }

  private HttpException(
    statusCode: number,
    status: string,
    errorsEnum: string,
    message: string,
    console?: string,
    object?: object,
  ): HttpException {
    if (console) {
      this.logger.error(console)
    }

    const response = {
      statusCode,
      status,
      errorName: errorsEnum,
      alert: 0,
      message,
      object,
    }

    if (alertReporting.includes(errorsEnum)) {
      response.alert = 1
    }
    this.logger.error(JSON.stringify(response))
    return new HttpException(response, statusCode)
  }
}
