import { customizeValidator, CustomValidatorOptionsType } from '@rjsf/validator-ajv8'
import { SchemaValidateFunction, Vocabulary } from 'ajv'

import { baAjvFormats } from './ajvFormats'
import { baAjvKeywords } from './ajvKeywords'

export const getBaRjsfValidator = (customKeywords?: Vocabulary) =>
  customizeValidator({
    // The type in @rjsf/validator-ajv8 is wrong.
    customFormats: baAjvFormats as unknown as CustomValidatorOptionsType['customFormats'],
    ajvOptionsOverrides: {
      keywords: customKeywords ?? baAjvKeywords,
    },
  })

/**
 * Generates keywords with custom file validation function.
 */
const getFileValidatorBaAjvKeywords = (fileValidateFn: SchemaValidateFunction) => {
  return baAjvKeywords.map((keyword) => {
    if (keyword.keyword === 'baFile') {
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
