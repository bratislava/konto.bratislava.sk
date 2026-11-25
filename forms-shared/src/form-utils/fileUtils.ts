import type { GenericObjectType, RJSFSchema } from '@rjsf/utils'
import { SchemaValidateFunction } from 'ajv'
import traverse from 'neotraverse/legacy'

import { validateBaFileUuid } from './ajvFormats'
import { withFileValidateFn } from './ajvKeywords'
import { getBaRjsfValidator } from './validators'

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
 * Ajv calls the `baFile` keyword for each file field it validates (see `withFileValidateFn`), which
 * is used to extract the file ids from the form data.
 */
export const getFileUuids = (schema: RJSFSchema, formData: GenericObjectType) => {
  const files: string[] = []
  const fileValidateFn: SchemaValidateFunction = (innerSchema, data) => {
    if (data) {
      files.push(data as string)
    }
    return true
  }

  const validator = getBaRjsfValidator()
  withFileValidateFn(fileValidateFn, () => validator.isValid(schema, formData, schema))

  return files
}
