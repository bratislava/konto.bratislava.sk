import { MagproxyErrorsEnum } from '../../magproxy/magproxy.errors.enum'
import {
  SendToQueueErrorsEnum,
  VerificationErrorsEnum,
} from '../../user-verification/verification.errors.enum'
import { UserErrorsEnum } from '../../user/user.error.enum'
import { ErrorsEnum } from '../guards/dtos/error.dto'
import { SubserviceErrorsEnum } from '../subservices/subservice.errors.enum'

/**
 * This set contains all of the errors, which should be alerted in grafana when they are thrown.
 * If there is some new error enum, which should alert the developers, please add it to this list.
 * Do not add errors, which are not not necessary to alert, for example some NOT_FOUND errors from a controller,
 * invoked when a client tries to retrieve a form with nonexistent uuid.
 */
export default [
  VerificationErrorsEnum.INVALID_CAPTCHA,
  ErrorsEnum.DATABASE_ERROR,
  ErrorsEnum.INTERNAL_SERVER_ERROR,
  SendToQueueErrorsEnum.COGNITO_CHANGE_TIER_ERROR,
  VerificationErrorsEnum.DATABASE_ERROR,
  SendToQueueErrorsEnum.RABBIT_PUSH_DATA_ERROR,
  UserErrorsEnum.COGNITO_TYPE_ERROR,
  MagproxyErrorsEnum.RFO_ACCESS_ERROR,
  MagproxyErrorsEnum.RFO_DATA_ARRAY_EXPECTED,
  MagproxyErrorsEnum.RFO_UNEXPECTED_RESPONSE,
  MagproxyErrorsEnum.RPO_UNEXPECTED_RESPONSE,
  VerificationErrorsEnum.UNEXPECTED_UPVS_RESPONSE,
  VerificationErrorsEnum.EMPTY_RFO_RESPONSE,
  VerificationErrorsEnum.EMPTY_RPO_RESPONSE,
  SubserviceErrorsEnum.CITY_ACCOUNT_DELIVERY_METHOD_WITHOUT_DATE,
] as string[]
