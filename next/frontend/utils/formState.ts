import { GenericObjectType, retrieveSchema, RJSFSchema } from '@rjsf/utils'
import { JSONSchema7 } from 'json-schema'
import pick from 'lodash/pick'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useEffectOnceWhen } from 'rooks'

import { FormStepIndex, FormStepperStep } from '../../components/forms/types/Steps'
import { rjsfValidator } from './form'
import { isDefined } from './general'

export const SUMMARY_HASH = 'sumar'

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
      const retrievedSchema = retrieveSchema(rjsfValidator, step, schema, formData)

      return Object.keys(retrievedSchema).length > 0 ? retrievedSchema : null
    }) ?? []
  )
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

      const stepProperty = getStepProperty(step)!
      const { title, hash } = step.properties[stepProperty] as JSONSchema7 & { hash: string }

      // displayIndex is only incremented for non-empty steps
      displayIndex += 1
      return {
        index,
        displayIndex,
        title,
        isSubmitted: submittedSteps.has(index),
        isSummary: false,
        hash,
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
      hash: SUMMARY_HASH,
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
 * Returns a first non-empty step index.
 */
export const getFirstNonEmptyStepIndex = (stepSchemas: (JSONSchema7 | null)[]) => {
  const firstStep = stepSchemas.findIndex((step) => step !== null)
  return firstStep !== -1 ? firstStep : ('summary' as const)
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
) => {
  const evaluatedSchemas = getEvaluatedStepsSchemas(schema, formData)
  const propertiesToKeep = evaluatedSchemas.map(getStepProperty).filter(isDefined)

  return pick(formData, propertiesToKeep)
}

/**
 * Retrieves the hash of a step from provided schema.
 */
const getStepHash = (stepSchema: JSONSchema7 | null) => {
  if (!stepSchema) {
    return null
  }

  const stepProperty = getStepProperty(stepSchema)
  if (!stepProperty) {
    return null
  }

  const step = stepSchema?.properties?.[stepProperty] as JSONSchema7 & { hash?: string }
  return step.hash
}

/**
 * A custom hook that holds the state of the current step index and synchronizes its value with the hash in the URL.
 * @param stepSchemas
 */
export const useCurrentStepIndex = (stepSchemas: (JSONSchema7 | null)[]) => {
  const router = useRouter()

  const initialValue = getFirstNonEmptyStepIndex(stepSchemas)
  const [currentStepIndex, setCurrentStepIndex] = useState<FormStepIndex>(initialValue)

  // Gets the current step and updates the hash if needed
  const syncStepToHash = useCallback(
    (index: FormStepIndex, replace: boolean = false) => {
      const routerFn = replace ? router.replace : router.push

      if (index === 'summary') {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        routerFn(`#${SUMMARY_HASH}`)
        return
      }
      const schema = stepSchemas?.[index]
      const stepHash = getStepHash(schema)

      if (!stepHash) {
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      routerFn(`#${stepHash}`)
    },
    [router, stepSchemas],
  )

  // Receives the current hash and updates the step index if needed
  const onHashChange = useCallback(
    (hash: string) => {
      // eslint-disable-next-line security/detect-possible-timing-attacks
      if (hash === `#${SUMMARY_HASH}`) {
        setCurrentStepIndex('summary')
        return
      }

      const hashStepIndex = stepSchemas.findIndex((schema) => {
        const stepHash = getStepHash(schema)

        if (!stepHash) {
          return false
        }

        return hash === `#${stepHash}`
      })

      if (hashStepIndex !== -1 && hashStepIndex !== currentStepIndex) {
        setCurrentStepIndex(hashStepIndex)
      }

      // If the hash in the URL is not a valid step, update the hash to the current step by replacing the router state
      if (hashStepIndex === -1) {
        // Calling hash change as hash change handler triggers "Error: Cancel rendering route" which is an expected behavior
        syncStepToHash(currentStepIndex, true)
      }
    },
    [currentStepIndex, stepSchemas, syncStepToHash],
  )

  // Initially sync the hash and the step index
  useEffectOnceWhen(() => {
    // If the URL contains a hash, use it to set the current step
    if (window.location.hash) {
      onHashChange(window.location.hash)
      return
    }

    // Otherwise, sync the hash with the current step
    syncStepToHash(currentStepIndex, true)
  }, router.isReady)

  useEffect(() => {
    const onWindowHashChange = () => onHashChange(window.location.hash)
    const onNextHashChange = (url: string) => {
      const urlInstance = new URL(url, window.location.origin)
      onHashChange(urlInstance.hash)
    }

    router.events.on('hashChangeStart', onNextHashChange)
    window.addEventListener('hashchange', onWindowHashChange)
    window.addEventListener('load', onWindowHashChange)
    return () => {
      router.events.off('hashChangeStart', onNextHashChange)
      window.removeEventListener('load', onWindowHashChange)
      window.removeEventListener('hashchange', onWindowHashChange)
    }
  }, [currentStepIndex, onHashChange, router.asPath, router.events, stepSchemas])

  // Patched version of setCurrentStepIndex that also updates the hash
  const setCurrentStepIndexPatched = (index: FormStepIndex) => {
    syncStepToHash(index)
    setCurrentStepIndex(index)
  }

  return { currentStepIndex, setCurrentStepIndex: setCurrentStepIndexPatched }
}
