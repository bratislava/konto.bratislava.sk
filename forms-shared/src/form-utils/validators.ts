import { customizeValidator, type CustomValidatorOptionsType } from '@rjsf/validator-ajv8'

import { baAjvFormats } from './ajvFormats'
import { baAjvKeywords } from './ajvKeywords'

export const getBaRjsfValidator = () =>
  customizeValidator({
    // The type in @rjsf/validator-ajv8 is wrong.
    customFormats: baAjvFormats as unknown as CustomValidatorOptionsType['customFormats'],
    ajvOptionsOverrides: {
      keywords: baAjvKeywords,
    },
  })
