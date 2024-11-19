import { GenericObjectType, retrieveSchema, RJSFSchema } from '@rjsf/utils'
import { BAJSONSchema7 } from './ajvKeywords'
import { baRjsfValidator } from './validators'
import { JSONSchema7, JSONSchema7Definition } from 'json-schema'

export const getStepProperty = (step: BAJSONSchema7 | null) => {
  if (!step?.properties) {
    return null
  }

  const keys = Object.keys(step.properties)
  return keys[0] ?? null
}

const isJsonSchema = (schema: JSONSchema7Definition | undefined): schema is JSONSchema7 => {
  return schema != null && typeof schema !== 'boolean'
}

export const getEvaluatedStepsSchemasLegacy = (
  schema: RJSFSchema,
  formData: GenericObjectType,
): (BAJSONSchema7 | null)[] => {
  return (
    schema.allOf?.map((step) => {
      if (typeof step === 'boolean') {
        return null
      }
      const retrievedSchema = retrieveSchema(baRjsfValidator, step, schema, formData)

      return Object.keys(retrievedSchema).length > 0 ? retrievedSchema : null
    }) ?? []
  )
}

export const getEvaluatedStepsSchemas = (
  schema: RJSFSchema,
  formData: GenericObjectType,
): (BAJSONSchema7 | null)[] =>
  schema.allOf?.map((step) => {
    if (!isJsonSchema(step)) {
      return null
    }

    if (!isJsonSchema(step.if) || !isJsonSchema(step.then)) {
      return step
    }

    const isValid = baRjsfValidator.isValid(step.if, formData, {})
    return (isValid ? step.then : null) ?? null
  }) ?? []
