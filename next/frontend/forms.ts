import { EFormValue } from '@backend/forms'
import Form from '@rjsf/core'
import {
  ErrorSchema,
  FormValidation,
  getDefaultFormState,
  retrieveSchema,
  RJSFSchema,
  RJSFValidationError,
  StrictRJSFSchema,
  ValidatorType,
} from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import { AnySchemaObject, ErrorObject, FuncKeywordDefinition } from 'ajv'
import { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import { cloneDeep, get, merge, set } from 'lodash'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ChangeEvent, RefObject, useEffect, useMemo, useRef, useState } from 'react'

import { StepData } from '../components/forms/types/TransformedFormData'
import {
  createForm,
  formDataToXml,
  getForm,
  submitEform,
  updateForm,
  validateKeyword,
  xmlToFormData,
} from "./api/api"
import { ApiError } from './api/data'
import { FormDto } from './dtos/formDto'
import useAccount from "./hooks/useAccount"
import useSnackbar from "./hooks/useSnackbar"
import { readTextFile } from "./utils/file"
import logger from './utils/logger'

export type JsonSchemaPropertyTree = JsonSchemaPropertyTreeInterface | undefined
export interface JsonSchemaPropertyTreeInterface {
  [key: string]: JsonSchemaPropertyTree
}

export type JsonSchema = JSONSchema7Definition
interface JsonSchemaProperties {
  [key: string]: JSONSchema7Definition
}

export type JsonSchemaExtraProperty = JSONSchema7Definition & { isConditional?: boolean }
export interface JsonSchemaExtraProperties {
  [key: string]: JsonSchemaExtraProperty
  isConditional?: boolean
}

export interface FormRJSFContext {
  bucketFolderName?: string
}

export const getAllPossibleJsonSchemaProperties = (
  jsonSchema?: JsonSchema,
): JsonSchemaProperties => {
  if (!jsonSchema || jsonSchema === true) {
    return {}
  }

  const properties: JsonSchemaProperties = {}
  if (jsonSchema.properties) {
    Object.assign(properties, { ...jsonSchema.properties })
  }

  if (jsonSchema.if && jsonSchema.then) {
    Object.assign(properties, getAllPossibleJsonSchemaProperties(jsonSchema.then))
  }
  if (jsonSchema.if && jsonSchema.else) {
    Object.assign(properties, getAllPossibleJsonSchemaProperties(jsonSchema.else))
  }

  jsonSchema?.allOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaProperties(s))
  })

  jsonSchema?.oneOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaProperties(s))
  })

  jsonSchema?.anyOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaProperties(s))
  })

  return properties
}

export const getAllPossibleJsonSchemaExtraProperties = (
  jsonSchema?: JsonSchema,
  isConditional?: boolean,
): JsonSchemaExtraProperties => {
  // same function as getAllPossibleJsonSchemaProperties but I need extra info if property is conditional
  // dont want to broke function getAllPossibleJsonSchemaProperties which is used on different places
  // TODO: simplify it together with getAllPossibleJsonSchemaProperties and do CLEAN CODE
  if (!jsonSchema || jsonSchema === true) {
    return {}
  }

  const properties: JsonSchemaProperties = {}
  if (jsonSchema.properties) {
    const newProperties = {}
    Object.entries(jsonSchema.properties).forEach(([key, value]) => {
      const newValue = typeof value !== 'boolean' ? { ...value, isConditional } : value
      Object.assign(newProperties, { [key]: newValue })
    })
    Object.assign(properties, newProperties)
  }

  if (jsonSchema.if && jsonSchema.then) {
    Object.assign(properties, getAllPossibleJsonSchemaExtraProperties(jsonSchema.then, true))
  }
  if (jsonSchema.if && jsonSchema.else) {
    Object.assign(properties, getAllPossibleJsonSchemaExtraProperties(jsonSchema.else, true))
  }

  jsonSchema?.allOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaExtraProperties(s, isConditional))
  })

  jsonSchema?.oneOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaExtraProperties(s, isConditional))
  })

  jsonSchema?.anyOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaExtraProperties(s, isConditional))
  })

  return properties
}

export const getJsonSchemaPropertyTree = (jsonSchema?: JsonSchema): JsonSchemaPropertyTree => {
  const properties = getAllPossibleJsonSchemaProperties(jsonSchema)
  const propertiesEntries = Object.entries(properties)

  if (propertiesEntries.length === 0) {
    return undefined
  }

  const result = propertiesEntries.map(([key, value]: [string, JSONSchema7]) => {
    return { [key]: getJsonSchemaPropertyTree(value) }
  })

  return Object.assign({}, ...result) as JsonSchemaPropertyTree
}

export const mergePropertyTreeToFormData = (
  formData: RJSFSchema,
  tree: JsonSchemaPropertyTree,
): RJSFSchema => {
  if (!tree || Array.isArray(formData)) return formData
  const newFormData: RJSFSchema = formData ? { ...formData } : ({} as RJSFSchema)

  Object.entries(tree).forEach(([key, value]: [string, JsonSchemaPropertyTree]) => {
    if (key in newFormData) {
      const property: RJSFSchema = newFormData[key]
      const merged = mergePropertyTreeToFormData(property, value)
      Object.assign(newFormData, { [key]: merged })
    } else {
      Object.assign(newFormData, { [key]: value })
    }
  })

  return newFormData
}

export const buildRJSFError = (path: string[], errorMsg: string | undefined): ErrorSchema => {
  return path.reduceRight(
    (memo: object, arrayValue: string) => {
      const error: ErrorSchema = {}
      error[arrayValue] = memo
      return error
    },
    { __errors: [errorMsg || 'error'] },
  ) as ErrorSchema
}

export const exampleAsyncValidation = (
  schema: AnySchemaObject,
  value: unknown,
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(!!value), 500)
  })
}

export interface KeywordDefinition extends FuncKeywordDefinition {
  validate?: (
    schema: AnySchemaObject,
    value: unknown,
    parentSchema?: AnySchemaObject,
  ) => boolean | Promise<boolean>
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



const getDefaults = (schema: RJSFSchema, path: string[], obj: object) => {
  if (schema.default) {
    // lodash modify obj param
    // eslint-disable-next-line lodash-fp/no-unused-result
    set(obj, path, schema.default)
  }

  const properties = getAllPossibleJsonSchemaProperties(schema)
  Object.keys(properties).forEach((key) => {
    const childSchema = properties[key] as RJSFSchema
    getDefaults(childSchema, [...path, key], obj)
  })

  return obj
}

export const getInitFormData = (schema: RJSFSchema): RJSFSchema => {
  const formData: RJSFSchema = getDefaults(schema, [], {})

  schema?.allOf.forEach((step) => {
    if (typeof step !== 'boolean') {
      const stepFormData = getDefaultFormState(validator, step, formData, schema, true)
      Object.assign(formData, stepFormData)
    }
  })

  return formData
}

export const createTestFormData = (formData: RJSFSchema): RJSFSchema => {
  const newFormData: RJSFSchema = {}
  if (!formData || typeof formData === 'boolean') return newFormData

  Object.entries(formData).forEach(([key, value]: [string, RJSFSchema]) => {
    if (typeof value !== 'boolean') {
      if (value === undefined) {
        Object.assign(newFormData, { [key]: null })
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(newFormData, { [key]: createTestFormData(value) })
      } else {
        Object.assign(newFormData, { [key]: value })
      }
    }
  })

  return newFormData
}



export const useFormRJSFContextMemo = (eform: EFormValue, formId?: string) => {
  return useMemo(() => {
    const { schema } = eform
    return {
      bucketFolderName:
        formId && schema?.pospID ? `/${String(schema.pospID)}/${formId}` : undefined,
    }
  }, [eform, formId])
}
