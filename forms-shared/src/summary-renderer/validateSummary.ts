import { GenericObjectType, RJSFSchema, ValidationData } from '@rjsf/utils'
import { FileInfoSummary, isErrorFileStatusType } from '../form-files/fileStatus'
import { SchemaValidateFunction } from 'ajv'
import { getFileValidatorBaRjsf } from '../form-utils/validators'
import { baGetDefaultFormStateStable } from '../form-utils/defaultFormState'
import { checkPathForErrors } from './checkPathForErrors'
import { validateBaFileUuid } from '../form-utils/ajvFormats'
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry'

export type ValidatedSummary = {
  hasErrors: boolean
  pathHasError: (path: string) => boolean
  filesInFormData: FileInfoSummary[]
  getFileById: (id: string) => FileInfoSummary | undefined
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
  validatorRegistry: BaRjsfValidatorRegistry,
): ValidatedSummary => {
  // When displaying summary, all the default data must be present to get correct error schema for each field, e.g. when
  // we have schema like this:
  //  - `wrapper` (object, required)
  //    - `field1` (string, required)
  //    - `field2` (string, optional)
  // but the initial data is `{}`, the error schema will be:
  // { property: 'wrapper', message: "must have required property 'wrapper'" }
  // if default data are added it correctly returns:
  // { property: 'wrapper.field1', message: "must have required property 'wrapper.field1'" }
  const defaultFormData = baGetDefaultFormStateStable(schema, formData, validatorRegistry)

  const filesInFormData: FileInfoSummary[] = []
  const fileValidateFn: SchemaValidateFunction = (schemaInner, id) => {
    if (!id) {
      return true
    }

    if (!validateBaFileUuid(id)) {
      return false
    }

    const fileInfo = fileInfos[id]
    if (!fileInfo) {
      return false
    }

    filesInFormData.push(fileInfo)

    return !isErrorFileStatusType(fileInfo.statusType)
  }

  const fileValidator = getFileValidatorBaRjsf(fileValidateFn)
  const validationResults = fileValidator.validateFormData(defaultFormData, schema)

  const hasErrors = Object.keys(validationResults.errorSchema).length > 0
  const pathHasError = (path: string) => checkPathForErrors(path, validationResults.errorSchema)
  const getFileById = (id: string) => filesInFormData.find((file) => file.id === id)

  return {
    ...validationResults,
    hasErrors,
    pathHasError,
    filesInFormData,
    getFileById,
  }
}
