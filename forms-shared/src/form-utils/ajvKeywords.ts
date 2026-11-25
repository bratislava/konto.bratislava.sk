import type { GenericObjectType } from '@rjsf/utils'
import type { KeywordDefinition, SchemaValidateFunction } from 'ajv'
import { JSONSchema7 } from 'json-schema'

declare module 'json-schema' {
  export interface JSONSchema7 {
    baFile?: boolean
    baUiSchema?: GenericObjectType
    baOrder?: number
  }
}

export type BAJSONSchema7 = JSONSchema7

let activeFileValidateFn: SchemaValidateFunction | undefined

/**
 * Runs `callback` with `fileValidateFn` used as the validate function of the `baFile` keyword, e.g. to collect or
 * validate the files in the form data. Ajv calls it for every file field it validates, so Ajv decides which fields are
 * validated (e.g. only active conditional branches), no traversal of the schema needs to be reimplemented.
 *
 * The keyword can't capture `fileValidateFn` itself, a validator would then be usable only for a single call and would
 * have to compile the whole schema each time. Ajv validation is synchronous, so nothing else can run while
 * `fileValidateFn` is active. Nested calls are a bug (files of one validation would be passed to the other one's
 * `fileValidateFn`), so they throw.
 */
export const withFileValidateFn = <T>(
  fileValidateFn: SchemaValidateFunction,
  callback: () => T,
): T => {
  if (activeFileValidateFn) {
    throw new Error('withFileValidateFn cannot be nested')
  }

  activeFileValidateFn = fileValidateFn
  try {
    return callback()
  } finally {
    activeFileValidateFn = undefined
  }
}

export const baAjvKeywords: KeywordDefinition[] = [
  {
    keyword: 'baFile',
    // Outside of `withFileValidateFn` the keyword is only an annotation
    validate: (schema, data, parentSchema, dataCxt) =>
      activeFileValidateFn ? activeFileValidateFn(schema, data, parentSchema, dataCxt) : true,
  },
  {
    keyword: 'baUiSchema',
  },
  {
    keyword: 'baOrder',
  },
]
