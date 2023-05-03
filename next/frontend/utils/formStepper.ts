import {
  ErrorSchema,
  FormValidation,
  getDefaultFormState,
  retrieveSchema,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils'
import { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import { get, merge, set } from 'lodash'

import { StepData } from '../../components/forms/types/TransformedFormData'
import { validateKeyword } from '../api/api'
import {
  ajvKeywords,
  JsonSchema,
  JsonSchemaExtraProperties,
  JsonSchemaProperties,
  JsonSchemaPropertyTree,
  KeywordDefinition, validator,
} from './formStepperData'


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


export const getAllStepData = (
  schemaAllOf: JSONSchema7Definition[],
  oldStepData?: StepData[],
): StepData[] => {
  if (!schemaAllOf || !Array.isArray(schemaAllOf)) return []
  return schemaAllOf
    .map((step) => {
      if (typeof step === 'boolean') return null
      const transformedStep: JSONSchema7 = step
      if (!transformedStep.properties || Object.values(transformedStep.properties).length === 0)
        return null
      const stepProperties = transformedStep.properties ?? {}
      const [key, value]: [string, JSONSchema7Definition] = Object.entries(stepProperties)[0]
      if (typeof value === 'boolean') return null
      // if step was already filled, we need to find out
      const reuseOldStep = oldStepData?.find((oldStep: StepData) => oldStep.stepKey === key)
      return {
        title: value.title ?? key,
        stepKey: key,
        isFilled: reuseOldStep?.isFilled || false,
      }
    })
    .filter(Boolean) as StepData[]
}

export const isFieldRequired = (fieldKey: string, schema: StrictRJSFSchema): boolean => {
  return Object.entries(schema).some(([key, value]: [string, StrictRJSFSchema]) => {
    if (key === 'required' && Array.isArray(value) && value.includes(fieldKey)) {
      return true
    }
    let isRequired = false
    if (key !== 'required' && value && Array.isArray(value)) {
      value.forEach((item: StrictRJSFSchema) => {
        isRequired = isRequired || isFieldRequired(fieldKey, item)
      })
    } else if (key !== 'required' && value && typeof value === 'object') {
      isRequired = isRequired || isFieldRequired(fieldKey, value)
    }
    return isRequired
  })
}

export const validateDateFromToFormat = (
  formData: RJSFSchema,
  errors: FormValidation,
  schema: RJSFSchema,
) => {
  const formDataKeys = Object.entries(formData)
  formDataKeys?.forEach(([key, value]: [string, RJSFSchema]) => {
    const schemaProperty: JSONSchema7Definition = schema.properties[key]
    if (
      schema?.properties &&
      schemaProperty &&
      typeof schemaProperty !== 'boolean' &&
      'dateFromTo' in schemaProperty &&
      schemaProperty.dateFromTo &&
      value.startDate &&
      value.endDate
    ) {
      const startDate = new Date(value.startDate as string)
      const endDate = new Date(value.endDate as string)

      if (endDate <= startDate) {
        errors[key]?.endDate?.addError('End date must be greater than start date')
      }
    }
  })
}

export const validateTimeFromToFormat = (
  formData: RJSFSchema,
  errors: FormValidation,
  schema: RJSFSchema,
) => {
  const formDataKeys = Object.entries(formData)
  formDataKeys?.forEach(([key, value]: [string, RJSFSchema]) => {
    const schemaProperty: JSONSchema7Definition = schema.properties[key]
    if (
      schema?.properties &&
      schemaProperty &&
      typeof schemaProperty !== 'boolean' &&
      'timeFromTo' in schemaProperty &&
      schemaProperty.timeFromTo &&
      value.startTime &&
      value.endTime
    ) {
      const startTime: number[] = (value.startTime as string)
        ?.split(':')
        .map((time: string) => parseInt(time, 10))

      const endTime: number[] = (value.endTime as string)
        ?.split(':')
        .map((time: string) => parseInt(time, 10))

      const startTimeSeconds = startTime[0] * 60 * 60 + startTime[1] * 60
      const endTimeSeconds = endTime[0] * 60 * 60 + endTime[1] * 60

      if (endTimeSeconds <= startTimeSeconds) {
        errors[key]?.endTime?.addError('End time must be greater than start time')
      }
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const validateRequiredFormat = (
  formData: RJSFSchema,
  errors: FormValidation,
  schema: StrictRJSFSchema,
) => {
  const REQUIRED_VALUE = 'Required input'
  Object.entries(formData).forEach(([key, value]: [string, RJSFSchema]) => {
    const currentErrors = errors[key]
    if (value && currentErrors && typeof value === 'object') {
      validateRequiredFormat(value, currentErrors, schema)
    } else if (!value && currentErrors && isFieldRequired(key, schema)) {
      currentErrors.addError(REQUIRED_VALUE)
    }
  })
}

export const customValidate = (formData: RJSFSchema, errors: FormValidation, schema: StrictRJSFSchema) => {
  // validateRequiredFormat(formData, errors, schema)
  validateDateFromToFormat(formData, errors, schema)
  validateTimeFromToFormat(formData, errors, schema)
  return errors
}

export const validateAsyncProperties = async (
  schema: RJSFSchema,
  data: unknown,
  path: string[],
): Promise<ErrorSchema> => {
  let errors = {}

  await Promise.all(
    ajvKeywords.map(async (k: KeywordDefinition) => {
      const keyword: string = k.keyword as string
      if (k.async === true && schema[keyword]) {
        const isValid = await validateKeyword(keyword, schema[keyword], get(data, path), schema)
        if (!isValid) {
          const schemaErrorMessage: string = (schema[keyword] as RJSFSchema).errorMsg as string
          errors = merge(errors, buildRJSFError(path, schemaErrorMessage))
        }
      }
    }),
  )

  const properties = getAllPossibleJsonSchemaProperties(schema)
  await Promise.all(
    Object.keys(properties).map(async (key) => {
      const childSchema = properties[key] as RJSFSchema
      errors = merge(errors, await validateAsyncProperties(childSchema, data, [...path, key]))
    }),
  )

  return errors
}


export const getDefaults = (schema: RJSFSchema, path: string[], obj: object) => {
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


export const getValidatedSteps = (schema: RJSFSchema, formData: RJSFSchema): RJSFSchema[] => {
  const testFormData = createTestFormData(formData)
  return schema?.allOf
    .map((step) => {
      const typedStep = typeof step !== 'boolean' ? step : {}
      return retrieveSchema(validator, typedStep, schema, testFormData)
    })
    .filter((step) => typeof step !== 'boolean' && Object.keys(step).length > 0)
}

