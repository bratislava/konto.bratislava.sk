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
import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from '../../oauth2/oauth2.error.enum'
import {
  OAuth2AuthorizationErrorDto,
  OAuth2TokenErrorDto,
} from '../../oauth2/dtos/errors.oauth2.dto'

@Injectable()
export default class ThrowerErrorGuard {
  NotAcceptableException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: Error | unknown
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
    error?: Error | unknown
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
    error?: Error | unknown
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
    error?: Error | unknown
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

  ForbiddenException(
    errorEnum: CustomErrorEnums,
    message: string,
    console?: string,
    error?: Error | unknown
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
    error?: Error | unknown
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
    error?: Error | unknown
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
    error?: Error | unknown
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
    error?: Error | unknown
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

  // OAuth2 errors

  /**
   * Throws an OAuth2 authorization error
   * The OAuth2ExceptionFilter will automatically convert this to a 303 redirect
   *
   * @param errorCode - OAuth2 authorization error code
   * @param errorDescription - Optional human-readable error description
   * @param errorUri - Optional URI identifying a human-readable error page
   * @returns HttpException that will be intercepted by OAuth2ExceptionFilter
   */
  OAuth2AuthorizationException(
    errorCode: OAuth2AuthorizationErrorCode,
    errorDescription?: string,
    errorUri?: string
  ): HttpException {
    const response: OAuth2AuthorizationErrorDto = {
      error: errorCode,
      error_description: errorDescription,
      error_uri: errorUri,
    }

    // Note: state will be automatically added by OAuth2ExceptionFilter from request query
    return new HttpException(response, HttpStatus.BAD_REQUEST)
  }

  /**
   * Creates an OAuth2 token endpoint error per RFC 6749 Section 5.2
   * Token errors return HTTP 400 with JSON body
   *
   * @param errorCode - OAuth2 token error code
   * @param errorDescription - Optional human-readable error description
   * @param errorUri - Optional URI identifying a human-readable error page
   * @returns HttpException with 400 status
   */
  OAuth2TokenException(
    errorCode: OAuth2TokenErrorCode,
    errorDescription?: string,
    errorUri?: string
  ): HttpException {
    const response: OAuth2TokenErrorDto = {
      error: errorCode,
      error_description: errorDescription,
      error_uri: errorUri,
    }

    return new HttpException(response, HttpStatus.BAD_REQUEST)
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
