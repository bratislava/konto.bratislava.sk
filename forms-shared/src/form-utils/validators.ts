import { ValidatorType } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import type { CustomValidatorOptionsType } from '@rjsf/validator-ajv8/src/types'
import Ajv, { SchemaValidateFunction, Vocabulary } from 'ajv'

import { baAjvFormats } from './ajvFormats'
import { baAjvKeywords } from './ajvKeywords'

const getBaRjsfValidator = (customKeywords?: Vocabulary) =>
  customizeValidator({
    // The type in @rjsf/validator-ajv8 is wrong.
    customFormats: baAjvFormats as unknown as CustomValidatorOptionsType['customFormats'],
    ajvOptionsOverrides: {
      // @ts-expect-error: The type in @rjsf/validator-ajv8 is wrong.
      keywords: customKeywords ?? baAjvKeywords,
    },
  })

/**
 * Default RJSF validator that should be used for all forms.
 */
export const baRjsfValidator = getBaRjsfValidator()

/**
 * Extracts the AJV validator from the RJSF validator.
 *
 * RJSF uses its custom logic to create AJV instance, easier than mimicking the behaviour is to extract the instance by
 * accessing the private property. If this changes in the future, the tests will fail.
 */
const extractAjvValidator = (rjsfValidator: ValidatorType) =>
  (rjsfValidator as unknown as { ajv: Ajv }).ajv

/**
 * Extracted AJV validator from the default RJSF validator.
 */
export const baAjvValidator = extractAjvValidator(baRjsfValidator)

/**
 * Generates keywords with custom file validation function.
 */
const getFileValidatorBaAjvKeywords = (fileValidateFn: SchemaValidateFunction) => {
  return baAjvKeywords.map((keyword) => {
    if (keyword.keyword === 'file') {
      return {
        ...keyword,
        validate: fileValidateFn,
      }
    }
    return keyword
  })
}

/**
 * The only reliable although hacky way how to traverse files in the form data is to provide keyword
 * with a custom validate function for AJV. This validator is used to work with the file UUIDs from the
 * form data.
 */
export const getFileValidatorBaRjsf = (fileValidateFn: SchemaValidateFunction) => {
  return getBaRjsfValidator(getFileValidatorBaAjvKeywords(fileValidateFn))
}
