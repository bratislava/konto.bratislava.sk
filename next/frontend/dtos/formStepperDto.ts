import { ValidatorType } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import { AnySchemaObject, FuncKeywordDefinition } from 'ajv'
import { JSONSchema7Definition } from 'json-schema'

export type JsonSchemaPropertyTree = JsonSchemaPropertyTreeInterface | undefined
export interface JsonSchemaPropertyTreeInterface {
  [key: string]: JsonSchemaPropertyTree
}

export type JsonSchema = JSONSchema7Definition
export interface JsonSchemaProperties {
  [key: string]: JSONSchema7Definition
}

export type JsonSchemaExtraProperty = JSONSchema7Definition & { isConditional?: boolean }
export interface JsonSchemaExtraProperties {
  [key: string]: JsonSchemaExtraProperty | undefined
  isConditional?: boolean
}

export interface FormRJSFContext {
  bucketFolderName?: string
  fileScans: FileScan[]
}

export interface KeywordDefinition extends FuncKeywordDefinition {
  validate?: (
    schema: AnySchemaObject,
    value: unknown,
    parentSchema?: AnySchemaObject,
  ) => boolean | Promise<boolean>
}

export const exampleAsyncValidation = (
  schema: AnySchemaObject,
  value: unknown,
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(!!value), 500)
  })
}

export const ajvKeywords: KeywordDefinition[] = [
  {
    keyword: 'isExampleAsyncValidation',
    async: true,
    type: 'string',
    validate: exampleAsyncValidation,
  },
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

export type FileScanState = 'error'|'scan'|'finished'|'none'

export interface FileScan {
  fileName: string
  originalName: string
  fileState: FileScanState
}
