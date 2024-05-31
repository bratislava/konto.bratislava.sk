import { ErrorSchema } from '@rjsf/utils'

import { FormFileUploadFileInfo } from '../types/formFileUploadTypes'

export const formHasErrors = (errorSchema: ErrorSchema) => Object.keys(errorSchema).length > 0

export const isFormSigningDisabled = (
  errorSchema: ErrorSchema,
  infectedFiles: FormFileUploadFileInfo[],
) => formHasErrors(errorSchema) || infectedFiles.length > 0

/**
 * We want to disable submit button only in those cases, technically it is possible to send form with other errors,
 * but they are displayed in modal instead.
 */
export const isFormSubmitDisabled = (
  errorSchema: ErrorSchema,
  infectedFiles: FormFileUploadFileInfo[],
  isValidSignature: boolean,
) => formHasErrors(errorSchema) || infectedFiles.length > 0 || !isValidSignature
