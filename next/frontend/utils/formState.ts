import { GenericObjectType, getUiOptions, retrieveSchema, RJSFSchema } from '@rjsf/utils'
import { BAJSONSchema7 } from 'forms-shared/form-utils/ajvKeywords'
import { BaRjsfValidatorRegistry } from 'forms-shared/form-utils/validatorRegistry'
import { StepUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import pick from 'lodash/pick'

import { FormStepperStep } from '../../components/forms/types/Steps'
import { isDefined } from './general'

export const STEP_QUERY_PARAM_VALUE_SUMMARY = 'sumar'

/**
 * Evaluates each step with current form data and returns an array of schemas.
 *
 * Used for conditional steps, if the step doesn't satisfy its condition, it has an empty schema ({}).
 */
export const getEvaluatedStepsSchemas = (
  schema: RJSFSchema,
  formData: GenericObjectType,
  validatorRegistry: BaRjsfValidatorRegistry,
): (BAJSONSchema7 | null)[] => {
  return (
    schema.allOf?.map((step) => {
      if (typeof step === 'boolean') {
        return null
      }
      const validator = validatorRegistry.getValidator(schema)
      const retrievedSchema = retrieveSchema(validator, step, schema, formData)

      return Object.keys(retrievedSchema).length > 0 ? retrievedSchema : null
    }) ?? []
  )
}

/**
 * Each non-empty step defines exactly one property, this function returns the name of that property.
 */
export const getStepProperty = (step: BAJSONSchema7 | null) => {
  if (!step?.properties) {
    return null
  }

  const keys = Object.keys(step.properties)
  return keys[0] ?? null
}

export const getStepperData = (stepsSchemas: (BAJSONSchema7 | null)[]): FormStepperStep[] => {
  if (!stepsSchemas || !Array.isArray(stepsSchemas)) return []
  let displayIndex = 0

  const steps = stepsSchemas
    .map((step, index) => {
      if (!step) {
        return null
      }

      if (!step.properties || Object.values(step.properties).length !== 1) {
        throw new Error('Step must have exactly one property.')
      }

      const stepProperty = getStepProperty(step)
      if (!stepProperty) {
        throw new Error(`Step ${stepProperty} does not have a property.`)
      }
      const stepSchema = step.properties[stepProperty] as BAJSONSchema7

      const { stepperTitle, stepQueryParam: queryParam } = getUiOptions(
        stepSchema.baUiSchema,
      ) as StepUiOptions

      const { title, description } = stepSchema
      if (!title || !queryParam) {
        throw new Error(`Title or queryParam not found for step ${stepProperty}`)
      }

      // displayIndex is only incremented for non-empty steps
      displayIndex += 1
      return {
        index,
        displayIndex,
        title,
        stepperTitle,
        description,
        queryParam,
      } satisfies FormStepperStep
    })
    .filter(isDefined)

  return [
    ...steps,
    {
      index: 'summary',
      displayIndex: displayIndex + 1,
      queryParam: STEP_QUERY_PARAM_VALUE_SUMMARY,
    } satisfies FormStepperStep,
  ]
}

/**
 * When invoking an edit from summary, the only available info is the fieldId which contains the property defined by the
 * step.
 *
 * This function parses the property name from the fieldId.
 *
 * E.g.
 * root_inputStep_input1 -> inputStep
 * root_fileUploadStep_fileUpload1_0 -> fileUploadStep
 */
export const parseStepFromFieldId = (fieldId: string) => {
  const arr = fieldId.split('_')
  if (arr[0] === 'root' && arr[1]) {
    return arr[1]
  }
  return null
}

/**
 * Removes unused steps from formData. The schema is evaluated with provided data, the only non-empty steps properties
 * are kept.
 *
 * So far this only removes the first-level properties (steps), this function is not able to remove properties deeper
 * in the schema. (e.g. when a select in the second step is displayed based on the value of a select in the first step).
 *
 * TODO: Remove unused properties deeper in the schema.
 */
export const removeUnusedPropertiesFromFormData = (
  schema: RJSFSchema,
  formData: GenericObjectType,
  validatorRegistry: BaRjsfValidatorRegistry,
) => {
  const evaluatedSchemas = getEvaluatedStepsSchemas(schema, formData, validatorRegistry)
  const propertiesToKeep = evaluatedSchemas.map(getStepProperty).filter(isDefined)

  return pick(formData, propertiesToKeep)
}
