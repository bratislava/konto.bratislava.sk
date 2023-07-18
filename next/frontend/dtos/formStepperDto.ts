import { ValidatorType } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import { FuncKeywordDefinition } from 'ajv'

export const ajvKeywords: FuncKeywordDefinition[] = [
  {
    keyword: 'example',
  },
  {
    keyword: 'timeFromTo',
  },
  {
    keyword: 'dateFromTo',
  },
  {
    keyword: 'pospID',
  },
  {
    keyword: 'pospVersion',
  },
  {
    keyword: 'ciselnik',
  },
]

export const ajvFormats = {
  zip: /\b\d{5}\b/,
  time: /^[0-2]\d:[0-5]\d$/,
  ciselnik: () => true,
  file: () => true,
}

export const customFormats: Record<string, RegExp> = {
  zip: /\b\d{5}\b/,
  time: /^[0-2]\d:[0-5]\d$/,
}

export const validator: ValidatorType = customizeValidator({
  customFormats,
  ajvOptionsOverrides: { keywords: ajvKeywords },
})
