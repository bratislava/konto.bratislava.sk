import { GenericObjectType, RJSFSchema, ValidationData } from '@rjsf/utils'
import { FileInfoSummary, isErrorFileStatusType } from '../form-files/fileStatus'
import { SchemaValidateFunction } from 'ajv'
import { getFileValidatorBaRjsf } from '../form-utils/validators'
import { baGetDefaultFormState } from '../form-utils/defaultFormState'
import { checkPathForErrors } from './checkPathForErrors'

export type ValidatedSummary = {
  hasErrors: boolean
  pathHasError: (path: string) => boolean
  filesInFormData: FileInfoSummary[]
} & ValidationData<any>

/**
 * Validates the summary and returns error schema and info about files.
 *
 * This uses (or abuses) a possibility to provide a custom validate function for Ajv. This is only one of few ways how
 * to traverse the form data for specific values. In this case, we extract the files we need to give a special attention
 * in summary.
 */
export const validateSummary = (
  schema: RJSFSchema,
  formData: GenericObjectType,
  fileInfos: Record<string, FileInfoSummary>,
): ValidatedSummary => {
  const filesInFormData: FileInfoSummary[] = []

  const fileValidateFn: SchemaValidateFunction = (schemaInner, id) => {
    if (!id) {
      return true
    }

    if (typeof id !== 'string') {
      return false
    }

    const fileInfo = fileInfos[id]
    if (!fileInfo) {
      return false
    }

    filesInFormData.push(fileInfo)

    return !isErrorFileStatusType(fileInfo.statusType)
  }

  const validator = getFileValidatorBaRjsf(fileValidateFn)

  const defaultFormData = baGetDefaultFormState(schema, formData, undefined, validator)
  const validationResults = validator.validateFormData(defaultFormData, schema)

  const hasErrors = Object.keys(validationResults.errorSchema).length > 0
  const pathHasError = (path: string) => checkPathForErrors(path, validationResults.errorSchema)

  return {
    ...validationResults,
    hasErrors,
    pathHasError,
    filesInFormData,
  }
}
