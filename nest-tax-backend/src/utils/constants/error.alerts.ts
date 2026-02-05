import { CustomErrorNorisTypesEnum } from '../../noris/noris.errors'
import {
  CustomErrorPaymentResponseTypesEnum,
  CustomErrorPaymentTypesEnum,
} from '../../payment/dtos/error.dto'
import { CustomErrorTaxTypesEnum } from '../../tax/dtos/error.dto'
import { ErrorsEnum } from '../guards/dtos/error.dto'

/**
 * This set contains all of the errors, which should be alerted in grafana when they are thrown.
 * If there is some new error enum, which should alert the developers, please add it to this list.
 * Do not add errors, which are not not necessary to alert, for example some NOT_FOUND errors from a controller,
 * invoked when a client tries to retrieve a form with nonexistent uuid.
 */
export default [
  ErrorsEnum.INTERNAL_SERVER_ERROR,
  ErrorsEnum.DATABASE_ERROR,
  CustomErrorPaymentTypesEnum.DATABASE_ERROR,
  CustomErrorPaymentTypesEnum.CREATE_PAYMENT_URL,
  CustomErrorPaymentResponseTypesEnum.PAYMENT_RESPONSE_ERROR,
  CustomErrorPaymentTypesEnum.QR_CODE_NOT_FOUND,
  CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
  CustomErrorNorisTypesEnum.UPDATE_PAYMENTS_FROM_NORIS_ERROR,
  CustomErrorNorisTypesEnum.GET_TAXES_FROM_NORIS_ERROR,
  CustomErrorTaxTypesEnum.STATE_HOLIDAY_NOT_EXISTS,
  CustomErrorNorisTypesEnum.VALIDATE_NORIS_DATA_ERROR,
  CustomErrorPaymentTypesEnum.TAX_NOT_FOUND,
] as string[]
