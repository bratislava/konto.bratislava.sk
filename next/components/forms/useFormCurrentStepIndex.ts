import { createParser, useQueryState } from 'nuqs'
import { useEffect, useMemo, useRef } from 'react'

import { isDefined } from '@/frontend/utils/general'

import { FormStepIndex, FormStepperStep } from './types/Steps'

const getStepIndexByQueryParam = (
  steps: FormStepperStep[],
  queryParam: string | null | undefined,
) => {
  if (!isDefined(queryParam)) {
    return null
  }

  const step = steps.find((stepInner) => stepInner.queryParam === queryParam)
  return step?.index ?? null
}

const getQueryParamByStepIndex = (steps: FormStepperStep[], stepIndex: FormStepIndex) => {
  if (stepIndex == null) {
    return null
  }

  const step = steps.find((stepInner) => stepInner.index === stepIndex)
  return step?.queryParam ?? null
}

export const STEP_QUERY_PARAM_KEY = 'krok'

/**
 * A hook that holds the state of the current step index and synchronizes its value with `krok` query param in the URL.
 */
export const useFormCurrentStepIndex = (stepperData: FormStepperStep[]) => {
  // `nuqs` takes only the initial value of the parser, so we need to use a ref to access `stepSchemas` inside the parser
  const stepSchemasRef = useRef(stepperData)
  stepSchemasRef.current = stepperData
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
        .withOptions({ history: 'push', clearOnDefault: false })
        .withDefault(getCurrentStepSchemas()[0].index),
    [],
  )

  const [currentStepIndex, setCurrentStepIndex] = useQueryState(STEP_QUERY_PARAM_KEY, parser)

  useEffect(() => {
    // Initially if the query param is not present this sets it (`currentStepIndex` already contains default value)
    // https://github.com/47ng/nuqs/issues/405
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setCurrentStepIndex(currentStepIndex, { history: 'replace' })
    // Rewritten from useEffectOnce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { currentStepIndex, setCurrentStepIndex }
}
