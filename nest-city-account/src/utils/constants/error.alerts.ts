/* eslint-disable @typescript-eslint/no-unused-vars */
import { AdminErrorsEnum } from '../../admin/admin.errors.enum'
import { MagproxyErrorsEnum } from '../../magproxy/magproxy.errors.enum'
import { ErrorsEnum } from '../guards/dtos/error.dto'
import { UserErrorsEnum } from '../../user/user.error.enum'
import {
  SendToQueueErrorsEnum,
  VerificationErrorsEnum,
} from '../../user-verification/verification.errors.enum'

/**
 * This set contains all of the errors, which should be alerted in grafana when they are thrown.
 * If there is some new error enum, which should alert the developers, please add it to this list.
 * Do not add errors, which are not not necessary to alert, for example some NOT_FOUND errors from a controller,
 * invoked when a client tries to retrieve a form with nonexistent uuid.
 */
export default [] as string[]
