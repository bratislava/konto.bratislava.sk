import { FormError } from '@prisma/client'

import { FilesErrorsEnum } from '../../files/files.errors.enum'
import { FormsErrorsEnum } from '../../forms/forms.errors.enum'
import { NasesErrorsEnum } from '../../nases/nases.errors.enum'
import { ScannerClientErrorsEnum } from '../../scanner-client/scanner-client.errors.enum'
import { SignerErrorsEnum } from '../../signer/signer.errors.enum'
import { ErrorsEnum } from '../global-enums/errors.enum'
import { SharepointErrorsEnum } from '../subservices/dtos/sharepoint.errors.enum'

/**
 * This set contains all of the errors, which should be alerted in grafana when they are thrown.
 * If there is some new error enum, which should alert the developers, please add it to this list.
 * Do not add errors, which are not not necessary to alert, for example some NOT_FOUND errors from a controller,
 * invoked when a client tries to retrieve a form with nonexistent uuid.
 */
export default [
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
  NasesErrorsEnum.SEND_TO_GINIS_ERROR,
  ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
  ScannerClientErrorsEnum.FILE_HAS_WRONG_PARAMETERS,
  ScannerClientErrorsEnum.FILE_IN_SCANNER_NOT_FOUND,
  ErrorsEnum.DATABASE_ERROR,
  ErrorsEnum.INTERNAL_SERVER_ERROR,
  FormError.UNABLE_TO_SCAN_FILES,
  FormError.GINIS_SEND_ERROR,
  FormError.NASES_SEND_ERROR,
  FormError.RABBITMQ_MAX_TRIES,
  SignerErrorsEnum.XML_VALIDATION_ERROR,
  SharepointErrorsEnum.GENERAL_ERROR,
  FormsErrorsEnum.FORM_NOT_REGISTERED_IN_SLOVENSKO_SK,
] as string[]
