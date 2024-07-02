import { customizeValidator } from '@rjsf/validator-ajv8'
import type { CustomValidatorOptionsType } from '@rjsf/validator-ajv8/src/types'
import { SchemaValidateFunction, Vocabulary } from 'ajv'

import { baAjvFormats } from './ajvFormats'
import { baAjvKeywords } from './ajvKeywords'

const getBaRjsfValidator = (customKeywords?: Vocabulary) =>
  customizeValidator({
    // The type in @rjsf/validator-ajv8 is wrong.
    customFormats: baAjvFormats as unknown as CustomValidatorOptionsType['customFormats'],
    ajvOptionsOverrides: {
      keywords: customKeywords ?? baAjvKeywords,
    },
  })

/**
 * Default RJSF validator that should be used for all forms.
 */
export const baRjsfValidator = getBaRjsfValidator()

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
