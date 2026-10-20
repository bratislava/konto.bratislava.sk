import type { GenericObjectType, RJSFSchema, ValidationData } from '@rjsf/utils'
import { SchemaValidateFunction } from 'ajv'

import { FileInfoSummary, isErrorFileStatusType } from '../form-files/fileStatus'
import { validateBaFileUuid } from '../form-utils/ajvFormats'
import { withFileValidateFn } from '../form-utils/ajvKeywords'
import { baGetDefaultFormStateStable } from '../form-utils/defaultFormState'
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry'

type ValidateSummaryParams = {
  schema: RJSFSchema
  formData: GenericObjectType
  fileInfos: Record<string, FileInfoSummary>
  validatorRegistry: BaRjsfValidatorRegistry
}

export type ValidatedSummary = {
  hasErrors: boolean
  validationData: ValidationData<GenericObjectType>
  filesInFormData: FileInfoSummary[]
}

/**
 * Validates the summary and returns error schema and info about files.
 *
 * Ajv calls the `baFile` keyword for each file field it validates (see `withFileValidateFn`), which is used to collect
 * the files we need to give a special attention in summary and to report errors for the ones that are missing in
 * `fileInfos` or have an error status.
 */
export const validateSummary = ({
  schema,
  formData,
  fileInfos,
  validatorRegistry,
}: ValidateSummaryParams): ValidatedSummary => {
  // When displaying summary, all the default data must be present to get correct error schema for each field, e.g. when
  // we have schema like this:
  //  - `wrapper` (object, required)
  //    - `field1` (string, required)
  //    - `field2` (string, optional)
  // but the initial data is `{}`, the error schema will be:
  // { property: 'wrapper', message: "must have required property 'wrapper'" }
  // if default data are added it correctly returns:
  // { property: 'wrapper.field1', message: "must have required property 'wrapper.field1'" }
  const validator = validatorRegistry.getValidator(schema)
  // Use one validator for both the defaults and the validation. `SingleUseValidatorRegistry` returns a new validator
  // for every `getValidator` call, its isolation is meant between `validateSummary` calls, not within one.
  const reuseValidatorRegistry: BaRjsfValidatorRegistry = { getValidator: () => validator }
  const defaultFormData = baGetDefaultFormStateStable(schema, formData, reuseValidatorRegistry)

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

  const validationData = withFileValidateFn(fileValidateFn, () =>
    validator.validateFormData(defaultFormData, schema),
  )
  const hasErrors = Object.keys(validationData.errorSchema).length > 0

  return {
    hasErrors,
    validationData,
    filesInFormData,
  }
}
