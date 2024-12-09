import { HttpException, HttpStatus } from '@nestjs/common'

import alertReporting from '../constants/error.alerts'
import { CustomErrorEnums, ResponseErrorInternalDto } from './dtos/error.dto'

export default class ThrowerErrorGuard {
  NotAcceptableException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_ACCEPTABLE,
      errorEnum,
      message,
      status || 'Resource was not accepted.',
      console,
      object,
    )
  }

  GoneException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.GONE,
      errorEnum,
      message,
      status || 'Resource is gone.',
      console,
      object,
    )
  }

  PayloadTooLargeException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.PAYLOAD_TOO_LARGE,
      errorEnum,
      message,
      status || 'Payload to large.',
      console,
      object,
    )
  }

  InternalServerErrorException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      errorEnum,
      message,
      status || 'Internal server error',
      console,
      object,
    )
  }

  ForbiddenException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.FORBIDDEN,
      errorEnum,
      message,
      status || 'Forbidden',
      console,
      object,
    )
  }

  UnprocessableEntityException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.UNPROCESSABLE_ENTITY,
      errorEnum,
      message,
      status || 'Unprocessable entity',
      console,
      object,
    )
  }

  NotFoundException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_FOUND,
      errorEnum,
      message,
      status || 'Not found',
      console,
      object,
    )
  }

  BadRequestException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.BAD_REQUEST,
      errorEnum,
      message,
      status || 'Bad Request',
      console,
      object,
    )
  }

  UnauthorizedException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.UNAUTHORIZED,
      errorEnum,
      message,
      status || 'Unauthorized',
      console,
      object,
    )
  }

  private LoggingHttpException(
    statusCode: number,
    errorEnum: CustomErrorEnums,
    message: string,
    status: string,
    console?: string,
    object?: object,
  ): HttpException {
    const response: ResponseErrorInternalDto = {
      statusCode,
      status,
      errorName: errorEnum,
      [Symbol('alert')]: alertReporting.includes(errorEnum) ? 1 : 0,
      message,
      object,
      [Symbol('console')]: console,
    }

    return new HttpException(response, statusCode)
  }
}
