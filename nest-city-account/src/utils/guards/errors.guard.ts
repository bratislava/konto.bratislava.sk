import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import alertReporting from '../constants/error.alerts'
import { ResponseVerificationIdentityCardDto } from '../../user-verification/dtos/requests.verification.dto'
import { CognitoGetUserData } from '../global-dtos/cognito.dto'
import { CustomErrorEnums, ErrorSymbols, ResponseErrorInternalDto } from './dtos/error.dto'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../../user-verification/verification.errors.enum'
import { LineLoggerSubservice } from '../subservices/line-logger.subservice'
import { AxiosError } from 'axios'

@Injectable()
export default class ThrowerErrorGuard {
  NotAcceptableException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: Error,
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
    console?: string,
    error?: Error,
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
    console?: string,
    error?: Error,
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
    console?: string,
    error?: Error,
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
    console?: string,
    error?: Error,
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
    console?: string,
    error?: Error,
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
    console?: string,
    error?: Error,
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
    console?: string,
    error?: Error,
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
    console?: string,
    error?: Error,
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

@Injectable()
export class ErrorMessengerGuard {
  private logger: LineLoggerSubservice = new LineLoggerSubservice('CUSTOM ERRORS')

  birthNumberICInconsistency() {
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      status: 'CustomError',
      message: 'This identity card number is not matching identity card for birthNumber',
      errorName: VerificationErrorsEnum.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY,
    }
  }

  rfoDeadPerson() {
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      status: 'CustomError',
      message: 'User is not alive in registry.',
      errorName: VerificationErrorsEnum.DEAD_PERSON,
    }
  }

  rfoNotResponding(error: AxiosError) {
    this.logger.warn(error.response?.data)
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      status: 'CustomError',
      message: 'There is problem with unexpected registry response. More details in app logs.',
      errorName: VerificationErrorsEnum.RFO_NOT_RESPONDING,
    }
  }

  rpoNotResponding(error: AxiosError) {
    this.logger.warn(error.response?.data)
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      status: 'CustomError',
      message: 'There is problem with unexpected registry response. More details in app logs.',
      errorName: VerificationErrorsEnum.RPO_NOT_RESPONDING,
    }
  }

  birthNumberNotExists() {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      status: 'NotFound',
      message: 'Birth number does not exists in registry.',
      errorName: VerificationErrorsEnum.BIRTH_NUMBER_NOT_EXISTS,
    }
  }

  birthNumberBadFormat() {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      status: 'CustomError',
      message: 'Birth number has wrong format.',
      errorName: VerificationErrorsEnum.BIRTH_NUMBER_WRONG_FORMAT,
    }
  }

  rpoFieldNotExists(field: string) {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      status: 'NotFound',
      message: `Field '${field}' does not exists in RPO object from registry.`,
      errorName: VerificationErrorsEnum.RPO_FIELD_NOT_EXISTS,
    }
  }

  azureAdGetTokenTimeout() {
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      status: 'CustomError',
      message: 'There is problem with authentication to registry. More details in app logs.',
      errorName: VerificationErrorsEnum.RFO_ACCESS_ERROR,
    }
  }

  verificationQueueLog(
    user: CognitoGetUserData,
    data: ResponseVerificationIdentityCardDto,
    cognitoData?: string
  ) {
    this.logger.log({ type: 'ALL GOOD - 200', user, log: data, cognitoData })
  }

  verificationQueueError(user: CognitoGetUserData, data: ResponseVerificationIdentityCardDto) {
    this.logger.error({ type: 'Not Verified without error - 200', user, error: data })
  }

  birthNumberDuplicity() {
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      status: 'custom_error',
      message: VerificationErrorsResponseEnum.BIRTHNUMBER_IFO_DUPLICITY,
      errorName: VerificationErrorsEnum.BIRTHNUMBER_IFO_DUPLICITY,
    }
  }

  birthNumberIcoDuplicity() {
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      status: 'custom_error',
      message:
        'Duplicity of ICO - birth number pair. This user is already registered with different account.',
      errorName: VerificationErrorsEnum.BIRTHNUMBER_ICO_DUPLICITY,
    }
  }
}
