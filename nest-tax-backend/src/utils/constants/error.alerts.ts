import { ErrorsEnum } from '../guards/dtos/error.dto'

/**
 * This set contains all of the errors, which should be alerted in grafana when they are thrown.
 * If there is some new error enum, which should alert the developers, please add it to this list.
 * Do not add errors, which are not not necessary to alert, for example some NOT_FOUND errors from a controller,
 * invoked when a client tries to retrieve a form with nonexistent uuid.
 */
export default [
  ErrorsEnum.INTERNAL_SERVER_ERROR
] as string[]
