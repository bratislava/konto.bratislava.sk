import { GenericObjectType, retrieveSchema, RJSFSchema } from '@rjsf/utils'
import { JSONSchema7 } from 'json-schema'

import { FormStepIndex, FormStepperStep } from '../../components/forms/types/Steps'
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

export const getStepperData = (
  stepsSchemas: (JSONSchema7 | null)[],
  submittedSteps: Set<FormStepIndex>,
  summaryTitle: string,
): FormStepperStep[] => {
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

      // displayIndex is only incremented for non-empty steps
      displayIndex += 1
      return {
        index,
        displayIndex,
        title,
        isSubmitted: submittedSteps.has(index),
        isSummary: false,
      } as FormStepperStep
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
    } as FormStepperStep,
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
 * Each non-empty step defines exactly one property, this function returns the name of that property.
 */
export const getStepProperty = (step: JSONSchema7 | null) => {
  if (!step?.properties) {
    return null
  }

  const keys = Object.keys(step.properties)
  return keys[0] ?? null
}

/**
 * Returns a first non-empty step index.
 */
export const getFirstNonEmptyStepIndex = (stepSchemas: (JSONSchema7 | null)[]) => {
  const firstStep = stepSchemas.findIndex((step) => step !== null)
  return firstStep !== -1 ? firstStep : ('summary' as const)
}
