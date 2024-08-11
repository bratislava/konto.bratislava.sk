import { GenericObjectType, RJSFSchema } from '@rjsf/utils'
import { SchemaValidateFunction } from 'ajv'
import traverse from 'traverse'

import { getFileValidatorBaRjsf } from './validators'
import { validateBaFileUuid } from './ajvFormats'

/**
 * Extracts used file UUIDs from form data.
 *
 * This is a naive implementation that extracts all the valid UUIDs, but is very performant compared
 * to the "normal" version.
 */
export const getFileUuidsNaive = (formData: GenericObjectType) => {
  return traverse(formData).reduce(function traverseFn(acc: string[], value) {
    if (this.isLeaf && validateBaFileUuid(value)) {
      acc.push(value)
    }
    return acc
  }, []) as string[]
}

/**
 * Extracts used file UUIDs from form data.
 *
 * This uses (or abuses) a possibility to provide a custom validate function for AJV. This is only
 * one of few ways how to traverse the form data for specific values. In this case, we extract the
 * file ids from the form data.
 */
export const getFileUuids = (schema: RJSFSchema, formData: GenericObjectType) => {
  const files: string[] = []
  const fileValidateFn: SchemaValidateFunction = (innerSchema, data) => {
    if (data) {
      files.push(data as string)
    }
    return true
  }

  const validator = getFileValidatorBaRjsf(fileValidateFn)
  validator.isValid(schema, formData, formData)

  return files
}
