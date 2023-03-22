import { EnumOptionsType, ErrorSchema, RJSFValidationError, StrictRJSFSchema } from '@rjsf/utils'
import {
  getAllPossibleJsonSchemaExtraProperties,
  JsonSchema,
  JsonSchemaExtraProperties,
  JsonSchemaExtraProperty,
} from '@utils/forms'
import { JSONSchema7Definition } from 'json-schema'

import {
  TransformedFormData,
  TransformedFormStep,
} from '../components/forms/steps/Summary/TransformedFormData'

function findTitle(value: JSONSchema7Definition, items: JSONSchema7Definition[]) {
  if (typeof items === 'boolean') return value
  const enumOption = items.find(
    (item: JSONSchema7Definition) => typeof item !== 'boolean' && item.const === value,
  )
  return enumOption && typeof enumOption !== 'boolean' && enumOption.title
    ? enumOption.title
    : value
}

// transform value from formData which is array to simple text for Summary
// array values (select, checkboxes etc) are arrays with value of enum (property .const)
// we need original title of enum to show in Summary, so we must map it
function transformValueArray(
  fieldFormData?: JSONSchema7Definition,
  fieldSchema?: JSONSchema7Definition,
) {
  if (!fieldFormData || typeof fieldFormData === 'boolean') return
  if (!fieldSchema || typeof fieldSchema === 'boolean') return fieldFormData

  const items =
    fieldSchema.type === 'array' &&
    fieldSchema.items &&
    typeof fieldSchema.items === 'object' &&
    !Array.isArray(fieldSchema.items)
      ? fieldSchema.items.anyOf ?? fieldSchema.items.oneOf ?? fieldSchema.items.allOf
      : fieldSchema.oneOf

  if (!items || typeof items === 'boolean' || !Array.isArray(items)) return fieldFormData

  return Array.isArray(fieldFormData)
    ? fieldFormData.map((value) => findTitle(value, items))
    : findTitle(fieldFormData, items)
}

// get data of field in format we need in Summary
function getFieldData(
  label: string,
  schemaPath: string,
  isError: boolean,
  fieldFormData?: JSONSchema7Definition,
  fieldSchema?: JSONSchema7Definition,
  isConditional?: boolean,
): TransformedFormData {
  const transformedFieldFormData = transformValueArray(fieldFormData, fieldSchema)
  const value =
    transformedFieldFormData && !Array.isArray(transformedFieldFormData)
      ? transformedFieldFormData.toString()
      : Array.isArray(transformedFieldFormData) && transformedFieldFormData.length > 0
      ? transformedFieldFormData.join(', ')
      : null

  return {
    label,
    value,
    schemaPath,
    isError,
    isConditional,
  }
}

function isFieldError(
  formErrors: RJSFValidationError[][],
  schemaPath: string,
  fieldName: string,
): boolean {
  const errorProperty = `${schemaPath}.${fieldName}`
  return formErrors.some((errors) => {
    return errors.some((error) => error.property === errorProperty)
  })
}

// get all data from schema in 1D array (we use it for every step) in format we need for Summary
// TODO: refactor and CLEAN CODE somehow... but it's really complicated with lot of recursions and data
function getAllSchemaData(
  data: TransformedFormData[],
  schemaContent: JsonSchema,
  schemaPath: string,
  formErrors: RJSFValidationError[][],
  currentFormData?: JSONSchema7Definition,
  currentExtraErrors?: ErrorSchema,
  isConditional?: boolean,
): void {
  // read all properties (with info about conditions) we can from this layer of step
  const properties: JsonSchemaExtraProperties =
    getAllPossibleJsonSchemaExtraProperties(schemaContent)

  Object.entries(properties).forEach(([key, value]: [string, JsonSchemaExtraProperty]) => {
    // init data every property of this layer of schema
    const isChildConditional = isConditional || !!properties.isConditional || !!value.isConditional
    const newSchemaPath = `${schemaPath}.${key}`
    const childExtraErrors = currentExtraErrors ? currentExtraErrors[key] : undefined
    const childFormData: JSONSchema7Definition | undefined =
      currentFormData && typeof currentFormData !== 'boolean'
        ? currentFormData[key as keyof JSONSchema7Definition]
        : undefined

    if (value && typeof value !== 'boolean' && (!value.type || value.type === 'object')) {
      // if it's not field, continue recursively and go to deeper layer current schema
      getAllSchemaData(
        data,
        value,
        newSchemaPath,
        formErrors,
        childFormData,
        childExtraErrors,
        isChildConditional,
      )
    } else if (value && typeof value !== 'boolean' && value.type) {
      // if it's field, init data to get transformed data of field for usage in Summary
      const label = value.title ?? key
      const extraErrorCount: number = childExtraErrors?.__errors?.length ?? 0
      const isError: boolean = extraErrorCount > 0 || isFieldError(formErrors, schemaPath, key)
      // transform data of field for usage in Summary
      const fieldData: TransformedFormData = getFieldData(
        label,
        newSchemaPath,
        isError,
        childFormData,
        value,
        isChildConditional,
      )
      data.push(fieldData)
    }
  })
}

// transforming every step formData of form independently
function transformStepFormData(
  step: JSONSchema7Definition,
  formData: Record<string, JsonSchema>,
  formErrors: RJSFValidationError[][],
  extraErrors: ErrorSchema,
): TransformedFormStep {
  if (typeof step === 'boolean' || !step?.properties) return { key: '', label: '', data: [] }
  // init needed data to transform step formData
  const stepContent: JSONSchema7Definition = Object.values(step.properties)[0]
  const stepKey: string = Object.keys(step.properties)[0]
  const label: string =
    typeof stepContent !== 'boolean' && stepContent.title
      ? stepContent.title
      : typeof step !== 'boolean' && step.properties
      ? Object.keys(step.properties)[0]
      : ''
  const stepExtraErrors = extraErrors[stepKey]

  const data: TransformedFormData[] = []
  getAllSchemaData(data, stepContent, `.${stepKey}`, formErrors, formData[stepKey], stepExtraErrors)
  return { key: stepKey, label, data }
}

// transforms formData to format which is used to show data in Summary
export const useFormDataTransform = (
  formData: Record<string, JsonSchema>,
  formErrors: RJSFValidationError[][],
  extraErrors: ErrorSchema,
  schema?: StrictRJSFSchema,
) => {
  const transformedSteps: TransformedFormStep[] = schema?.allOf
    ? schema.allOf.map((step) => transformStepFormData(step, formData, formErrors, extraErrors))
    : []

  return {
    transformedSteps,
  }
}
