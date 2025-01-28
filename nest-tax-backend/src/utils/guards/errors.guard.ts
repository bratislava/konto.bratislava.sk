import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import alertReporting from '../constants/error.alerts'
import {
  CustomErrorEnums,
  ErrorSymbols,
  ResponseErrorInternalDto,
} from './dtos/error.dto'

@Injectable()
export class ErrorThrowerGuard {

  NotAcceptableException(
    errorEnum: CustomErrorEnums,
    message: string,
    status?: string,
    console?: string,
    object?: object,
  ): HttpException {
    return this.LoggingHttpException(
      HttpStatus.NOT_ACCEPTABLE,
      status || 'Resource was not accepted.',
      errorEnum,
      message,
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
      status || 'Resource is gone.',
      errorEnum,
      message,
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
      status || 'Payload to large.',
      errorEnum,
      message,
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
      status || 'Internal server error',
      errorEnum,
      message,
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
      status || 'Forbidden',
      errorEnum,
      message,
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
      status || 'Unprocessable entity',
      errorEnum,
      message,
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
      status || 'Not found',
      errorEnum,
      message,
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
      status || 'Bad Request',
      errorEnum,
      message,
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
      status || 'Unauthorized',
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
    const response: ResponseErrorInternalDto = {
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
