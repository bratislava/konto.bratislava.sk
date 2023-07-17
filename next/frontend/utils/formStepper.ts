import { retrieveSchema, RJSFSchema } from '@rjsf/utils'
import { JSONSchema7, JSONSchema7Definition } from 'json-schema'

import { StepData } from '../../components/forms/types/TransformedFormData'
import { validator } from '../dtos/formStepperDto'

export const getAllStepData = (
  schemaAllOf: JSONSchema7Definition[],
  submittedSteps: Set<number>,
  summaryTitle?: string,
): StepData[] => {
  if (!schemaAllOf || !Array.isArray(schemaAllOf)) return []
  let displayIndex = 0

  const steps = schemaAllOf
    .map((step, index) => {
      if (typeof step === 'boolean') return null
      const transformedStep: JSONSchema7 = step
      if (!transformedStep.properties || Object.values(transformedStep.properties).length === 0)
        return null
      const stepProperties = transformedStep.properties ?? {}
      const [key, value]: [string, JSONSchema7Definition] = Object.entries(stepProperties)[0]
      if (typeof value === 'boolean') return null

      displayIndex += 1
      return {
        index,
        displayIndex,
        title: value.title ?? key,
        isFilled: submittedSteps.has(index),
        isSummary: false,
      }
    })
    .filter(Boolean) as StepData[]

  displayIndex += 1
  return [
    ...steps,
    {
      index: 'summary',
      displayIndex,
      title: summaryTitle,
      isFilled: submittedSteps.has(steps.length),
      isSummary: true,
    } as StepData,
  ]
}

export const getValidatedSteps = (schema: RJSFSchema, formData: RJSFSchema): RJSFSchema[] => {
  return schema.allOf
    ? schema.allOf.map((step) => {
        const typedStep = typeof step !== 'boolean' ? step : {}
        const retrievedSchema = retrieveSchema(validator, typedStep, schema, formData)
        return Object.keys(retrievedSchema).length > 0 ? retrievedSchema : {}
      })
    : []
}
