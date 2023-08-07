import { GenericObjectType, retrieveSchema, RJSFSchema } from '@rjsf/utils'
import { JSONSchema7 } from 'json-schema'

import { FormStepIndex, FormStepMetadata } from '../../components/forms/types/Steps'
import { rjfsValidator } from './form'
import { isDefined } from './general'

/**
 * Evaluates each step with current form data and returns an array of schemas.
 *
 * Used for conditional steps, if the step doesn't satisfy its condition, it has an empty schema ({}).
 */
export const getEvaluatedStepsSchemas = (
  schema: RJSFSchema,
  formData: GenericObjectType,
): (JSONSchema7 | null)[] => {
  return (
    schema.allOf?.map((step) => {
      if (typeof step === 'boolean') {
        return null
      }
      const retrievedSchema = retrieveSchema(rjfsValidator, step, schema, formData)

      return Object.keys(retrievedSchema).length > 0 ? retrievedSchema : null
    }) ?? []
  )
}

export const getStepsMetadata = (
  stepsSchemas: (JSONSchema7 | null)[],
  submittedSteps: Set<FormStepIndex>,
  summaryTitle: string,
): FormStepMetadata[] => {
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

      const { title } = Object.values(step.properties)[0] as JSONSchema7

      displayIndex += 1
      return {
        index,
        displayIndex,
        title,
        isSubmitted: submittedSteps.has(index),
        isSummary: false,
      } as FormStepMetadata
    })
    .filter(isDefined)

  return [
    ...steps,
    {
      index: 'summary',
      displayIndex: displayIndex + 1,
      title: summaryTitle,
      isSubmitted: submittedSteps.has(steps.length),
      isSummary: true,
    } as FormStepMetadata,
  ]
}
export const parseStepFromFieldId = (fieldId: string) => {
  const arr = fieldId.split('_')
  if (arr[0] === 'root' && arr[1]) {
    return arr[1]
  }
  return null
}

export const getStepProperty = (step: JSONSchema7 | null) => {
  if (!step?.properties) {
    return null
  }

  const keys = Object.keys(step.properties)
  return keys[0] ?? null
}
