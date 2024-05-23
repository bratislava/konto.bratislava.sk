import { FormError } from '@prisma/client'

import { ConvertErrorsEnum } from '../../convert/errors/convert.errors.enum'
import { FilesErrorsEnum } from '../../files/files.errors.enum'
import { NasesErrorsEnum } from '../../nases/nases.errors.enum'
import { ScannerClientErrorsEnum } from '../../scanner-client/scanner-client.errors.enum'
import { ErrorsEnum } from '../global-enums/errors.enum'

/**
 * This set contains all of the errors, which should be alerted in grafana when they are thrown.
 * If there is some new error enum, which should alert the developers, please add it to this list.
 * Do not add errors, which are not not necessary to alert, for example some NOT_FOUND errors from a controller,
 * invoked when a client tries to retrieve a form with nonexistent uuid.
 */
export default [
  ConvertErrorsEnum.ELEMENT_NOT_FOUND,
  ConvertErrorsEnum.UNPROCESSABLE_TYPE,
  FilesErrorsEnum.FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR,
  FilesErrorsEnum.SCANNER_NO_RESPONSE_ERROR,
  FilesErrorsEnum.FILE_UPLOAD_TO_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
  FilesErrorsEnum.FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
  FilesErrorsEnum.FILE_DOWNLOAD_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
  FilesErrorsEnum.FILE_MINIO_CHECK_ERROR,
  FilesErrorsEnum.FILE_BY_SCANNERID_NOT_FOUND_ERROR,
  NasesErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT,
  NasesErrorsEnum.CITY_ACCOUNT_USER_GET_ERROR,
  NasesErrorsEnum.SEND_TO_NASES_ERROR,
  ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
  ScannerClientErrorsEnum.FILE_HAS_WRONG_PARAMETERS,
  ScannerClientErrorsEnum.FILE_IN_SCANNER_NOT_FOUND,
  ErrorsEnum.DATABASE_ERROR,
  ErrorsEnum.INTERNAL_SERVER_ERROR,
  FormError.UNABLE_TO_SCAN_FILES,
  FormError.GINIS_SEND_ERROR,
  FormError.NASES_SEND_ERROR,
  FormError.RABBITMQ_MAX_TRIES,
] as string[]
