import { HttpException, Injectable, Logger } from '@nestjs/common'

import { HttpStatusCode } from 'axios'
import { RfoDataMagproxyDto, RpoDataMagproxyDto } from '../../magproxy/dtos/magproxy.dto'
import { ResponseVerificationIdentityCardDto } from '../../user-verification/dtos/requests.verification.dto'
import { CognitoGetUserData } from '../global-dtos/cognito.dto'
import {
  CustomErrorAdminTypesEnum,
  CustomErrorSendToQueueEnum,
  CustomErrorUserEnum,
  CustomErrorVerificationTypesEnum,
  ErrorsEnum,
} from './dtos/error.dto'

@Injectable()
export class ErrorThrowerGuard {
  private logger: Logger = new Logger('CUSTOM ERRORS')

  unexpectedError(detail?: any) {
    if (detail) {
      this.logger.error(detail)
    }
    return new HttpException(
      {
        statusCode: 500,
        status: 'custom_error',
        message: 'Unexpected error',
        errorName: ErrorsEnum.INTERNAL_SERVER_ERROR,
      },
      500
    )
  }

  databaseError(detail?: any) {
    if (detail) {
      this.logger.error(detail)
    }
    return new HttpException(
      {
        statusCode: 422,
        status: 'custom_error',
        message: 'Error to write or update or read from/to database',
        errorName: CustomErrorVerificationTypesEnum.DATABASE_ERROR,
      },
      422
    )
  }

  verifyEidError(detail?: any) {
    if (detail) {
      this.logger.error(detail)
    }
    throw new HttpException(
      {
        statusCode: 422,
        status: 'custom_error',
        message: 'Failed to verify user with eid.',
        errorName: CustomErrorVerificationTypesEnum.VERIFY_EID_ERROR,
      },
      422
    )
  }

  magproxyRpoUnexpectedError(ico: string) {
    throw new HttpException(
      {
        statusCode: 422,
        status: 'unexpected',
        message: `Unexpected error occured while requesting legal entities for ico: ${ico}`,
        errorName: CustomErrorVerificationTypesEnum.UNEXPECTED_MAGPROXY_RESPONSE_ERROR,
      },
      422
    )
  }

  magproxyRpoResponseError(ico: string) {
    throw new HttpException(
      {
        statusCode: 404,
        status: 'not_found',
        message: `Failed to find legal entities for ico: ${ico}`,
        errorName: CustomErrorVerificationTypesEnum.LEGAL_ENTITIES_NOT_FOUND,
      },
      404
    )
  }

  noLegalEntitiesFoundViaRpoError(ico: string) {
    throw new HttpException(
      {
        statusCode: 404,
        status: 'not_found',
        message: `Failed to find legal entities for ico: ${ico}`,
        errorName: CustomErrorVerificationTypesEnum.LEGAL_ENTITIES_NOT_FOUND,
      },
      404
    )
  }

  noUserFoundForLegalEntity(birthNumber: string, ico: string) {
    throw new HttpException(
      {
        statusCode: 404,
        status: 'not_found',
        message: `Failed to find user with birthnumber: ${birthNumber} for ico: ${ico}.`,
        errorName: CustomErrorVerificationTypesEnum.USER_NOT_FOUND_IN_LEGAL_ENTITY,
      },
      404
    )
  }

  unexpectedUpvsResponseError(detail?: any) {
    if (detail) {
      this.logger.error(detail)
    }
    throw new HttpException(
      {
        statusCode: 422,
        status: 'custom_error',
        message: 'Unexpected UPVS response.',
        errorName: CustomErrorVerificationTypesEnum.UNEXPECTED_UPVS_RESPONSE,
      },
      422
    )
  }

  cognitoTierError(detail?: object) {
    if (detail) {
      this.logger.error(detail)
    }
    throw new HttpException(
      {
        statusCode: 422,
        status: 'custom_error',
        message: 'Error in change cognito tier.',
        errorName: CustomErrorSendToQueueEnum.COGNITO_CHANGE_TIER_ERROR,
      },
      422
    )
  }

  rabbitMQPushDataError(detail: any) {
    this.logger.error(detail)
    throw new HttpException(
      {
        statusCode: 422,
        status: 'custom_error',
        message: 'Error to push data to rabbit',
        errorName: CustomErrorSendToQueueEnum.RABBIT_PUSH_DATA_ERROR,
      },
      422
    )
  }

  azureAdGetTokenResponseError(error: any) {
    this.logger.error(error)
    throw new HttpException(
      {
        status: 'CustomError',
        message: 'There is problem with authentication to registry. More details in app logs.',
        errorName: CustomErrorVerificationTypesEnum.RFO_ACCESS_ERROR,
      },
      422
    )
  }

  adminDatabaseBirthNumberNotFound() {
    return new HttpException(
      {
        status: 'CustomError',
        message: 'There is no birthnumber',
        errorName: CustomErrorAdminTypesEnum.BIRTH_NUMBER_NOT_FOUND,
      },
      404
    )
  }

  userOrLegalPersonNotFound() {
    return new HttpException(
      {
        status: 'CustomError',
        message: 'User not found in database',
        errorName: CustomErrorUserEnum.USER_NOT_FOUND,
      },
      404
    )
  }

  userOrLegalPersonNoExternalId() {
    return new HttpException(
      {
        status: 'CustomError',
        message: 'User does not have cognito external id',
        errorName: CustomErrorUserEnum.NO_EXTERNAL_ID,
      },
      HttpStatusCode.UnprocessableEntity
    )
  }

  dataAndErrorDataNull(data: RfoDataMagproxyDto | RpoDataMagproxyDto) {
    return new HttpException(
      {
        status: 'CustomError',
        message: `Data and Error data null: ${JSON.stringify(data)}`,
        errorName: CustomErrorUserEnum.NO_EXTERNAL_ID,
      },
      HttpStatusCode.UnprocessableEntity
    )
  }

  icoNotProvided() {
    return new HttpException(
      {
        status: 'CustomError',
        message: 'Ico for verification was not provided',
        errorName: CustomErrorVerificationTypesEnum.ICO_NOT_PROVIDED,
      },
      HttpStatusCode.BadRequest
    )
  }

  ifoNotProvided() {
    return new HttpException(
      {
        status: 'CustomError',
        message: 'Ifo for verification was not provided',
        errorName: CustomErrorVerificationTypesEnum.IFO_NOT_PROVIDED,
      },
      HttpStatusCode.BadRequest
    )
  }

  verificationDataNotProvided() {
    throw new HttpException(
      {
        status: 'CustomError',
        message: 'Verification data (birthNumber, ifo ...) not provided.',
        errorName: CustomErrorVerificationTypesEnum.VERIFICATION_DATA_NOT_PROVIDED,
      },
      HttpStatusCode.BadRequest
    )
  }

  invalidTurnstileCaptcha() {
    throw new HttpException(
      {
        status: 'Bad Request',
        message:
          'Invalid captcha token. Please try again. If the problem persists and you are not robot, please contact support.',
        errorName: CustomErrorVerificationTypesEnum.INVALID_CAPTCHA,
      },
      400
    )
  }

  // TODO - needed a generic error, but we should get these in line with forms backend
  badRequestException(message?: string): HttpException {
    return new HttpException(
      {
        status: 'Bad Request',
        message: message || 'Bad request',
        errorName: ErrorsEnum.BAD_REQUEST_ERROR,
      },
      400
    )
  }
}

@Injectable()
export class ErrorMessengerGuard {
  private logger: Logger = new Logger('CUSTOM ERRORS')

  birthNumberICInconsistency() {
    return {
      statusCode: 422,
      status: 'CustomError',
      message: 'This identity card number is not matching identity card for birthNumber',
      errorName: CustomErrorVerificationTypesEnum.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY,
    }
  }

  rfoDeadPerson() {
    return {
      statusCode: 422,
      status: 'CustomError',
      message: 'User is not alive in registry.',
      errorName: CustomErrorVerificationTypesEnum.DEAD_PERSON,
    }
  }

  rfoNotResponding(error: any) {
    this.logger.warn(error.response.data)
    return {
      statusCode: 422,
      status: 'CustomError',
      message: 'There is problem with unexpected registry response. More details in app logs.',
      errorName: CustomErrorVerificationTypesEnum.RFO_NOT_RESPONDING,
    }
  }

  rpoNotResponding(error: any) {
    this.logger.warn(error.response.data)
    return {
      statusCode: 422,
      status: 'CustomError',
      message: 'There is problem with unexpected registry response. More details in app logs.',
      errorName: CustomErrorVerificationTypesEnum.RPO_NOT_RESPONDING,
    }
  }

  birthNumberNotExists() {
    return {
      statusCode: 404,
      status: 'NotFound',
      message: 'Birth number does not exists in registry.',
      errorName: CustomErrorVerificationTypesEnum.BIRTH_NUMBER_NOT_EXISTS,
    }
  }

  birthNumberBadFormat() {
    return {
      statusCode: 400,
      status: 'CustomError',
      message: 'Birth number has wrong format.',
      errorName: CustomErrorVerificationTypesEnum.BIRTH_NUMBER_WRONG_FORMAT,
    }
  }

  rpoFieldNotExists(field: string) {
    return {
      statusCode: 404,
      status: 'NotFound',
      message: `Field '${field}' does not exists in RPO object from registry.`,
      errorName: CustomErrorVerificationTypesEnum.RPO_FIELD_NOT_EXISTS,
    }
  }

  azureAdGetTokenTimeout() {
    return {
      statusCode: 422,
      status: 'CustomError',
      message: 'There is problem with authentication to registry. More details in app logs.',
      errorName: CustomErrorVerificationTypesEnum.RFO_ACCESS_ERROR,
    }
  }

  verificationQueueLog(
    user: CognitoGetUserData,
    data: ResponseVerificationIdentityCardDto,
    cognitoData?: string
  ) {
    this.logger.log({ type: 'ALL GOOD - 200', user: user, log: data, cognitoData: cognitoData })
  }

  verificationQueueError(user: CognitoGetUserData, data: ResponseVerificationIdentityCardDto) {
    this.logger.error({ type: 'Not Verified without error - 200', user: user, error: data })
  }

  birthNumberDuplicity() {
    return {
      statusCode: 422,
      status: 'custom_error',
      message:
        'Duplicity of birth number. This user is already registered with a different account.',
      errorName: CustomErrorVerificationTypesEnum.BIRTHNUMBER_IFO_DUPLICITY,
    }
  }

  birthNumberIcoDuplicity() {
    return {
      statusCode: 422,
      status: 'custom_error',
      message:
        'Duplicity of ICO - birth number pair. This user is already registered with different account.',
      errorName: CustomErrorVerificationTypesEnum.BIRTHNUMBER_ICO_DUPLICITY,
    }
  }
}
