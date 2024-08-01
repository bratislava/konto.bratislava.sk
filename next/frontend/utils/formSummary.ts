import { isUploadFileStatusType } from 'forms-shared/form-files/fileStatus'
import { ValidatedSummary } from 'forms-shared/summary-renderer/validateSummary'

export const isFormSigningDisabled = ({ hasErrors }: ValidatedSummary) => false

/**
 * We want to disable submit button only in those cases, technically it is possible to send form with other errors,
 * but they are displayed in modal instead.
 */
export const isFormSubmitDisabled = (
  { hasErrors, filesInFormData }: ValidatedSummary,
  isValidSignature: boolean,
) =>
  hasErrors ||
  !isValidSignature ||
  filesInFormData.some((file) => isUploadFileStatusType(file.statusType))
