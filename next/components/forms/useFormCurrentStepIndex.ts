import { BAJSONSchema7 } from 'forms-shared/form-utils/ajvKeywords'
import { createParser, useQueryState } from 'nuqs'
import { useMemo, useRef } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import {
  getFirstNonEmptyStepIndex,
  getStepProperty,
  SUMMARY_HASH,
} from '../../frontend/utils/formState'
import { FormStepIndex } from './types/Steps'

/**
 * Retrieves the query param of a step from provided schema.
 */
const getStepQueryParam = (stepSchema: BAJSONSchema7 | null) => {
  if (!stepSchema) {
    return null
  }

  const stepProperty = getStepProperty(stepSchema)
  if (!stepProperty) {
    return null
  }

  const step = stepSchema?.properties?.[stepProperty] as BAJSONSchema7 & { hash?: string }
  return step.hash
}

const getStepIndexByQueryParam = (
  stepSchemas: (BAJSONSchema7 | null)[],
  queryParam: string | null | undefined,
) => {
  if (!queryParam) {
    return null
  }

  if (queryParam === SUMMARY_HASH) {
    return 'summary' as const
  }

  const stepIndex = stepSchemas.findIndex((schema) => getStepQueryParam(schema) === queryParam)

  return stepIndex === -1 ? null : stepIndex
}

const getQueryParamByStepIndex = (
  stepSchemas: (BAJSONSchema7 | null)[],
  stepIndex: FormStepIndex,
) => {
  if (stepIndex === null || stepIndex === undefined) {
    return null
  }

  if (stepIndex === 'summary') {
    return SUMMARY_HASH
  }

  return getStepQueryParam(stepSchemas[stepIndex])
}

/**
 * A hook that holds the state of the current step index and synchronizes its value with `krok` query param in the URL.
 */
export const useFormCurrentStepIndex = (stepSchemas: (BAJSONSchema7 | null)[]) => {
  // `nuqs` takes only the initial value of the parser, so we need to use a ref to access `stepSchemas` inside the parser
  const stepSchemasRef = useRef(stepSchemas)
  stepSchemasRef.current = stepSchemas
  const getCurrentStepSchemas = () => stepSchemasRef.current

  const parser = useMemo(
    () =>
      createParser({
        parse(queryValue) {
          return getStepIndexByQueryParam(getCurrentStepSchemas(), queryValue)
        },
        serialize(value) {
          // `value` is guaranteed to be a correct step index, so we can safely cast it to string
          return getQueryParamByStepIndex(getCurrentStepSchemas(), value) as string
        },
      })
        .withOptions({ history: 'push' })
        .withDefault(getFirstNonEmptyStepIndex(getCurrentStepSchemas())),
    [],
  )

  const [currentStepIndex, setCurrentStepIndex] = useQueryState('krok', parser)

  useEffectOnce(() => {
    // Initially if the query param is not present this sets it (`currentStepIndex` already contains default value)
    // https://github.com/47ng/nuqs/issues/405
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setCurrentStepIndex(currentStepIndex, { history: 'replace' })
  })

  return { currentStepIndex, setCurrentStepIndex }
}
