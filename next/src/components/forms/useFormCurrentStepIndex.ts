import { type Options, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useEffect } from 'react'

import { FormStepIndex, FormStepperStep } from '@/src/components/forms/steps/types/Steps'
import { isDefined } from '@/src/frontend/utils/general'

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
  const [stepQueryParam, setStepQueryParam] = useQueryState(
    STEP_QUERY_PARAM_KEY,
    parseAsString.withOptions({ history: 'push', clearOnDefault: false }),
  )

  const currentStepIndex =
    getStepIndexByQueryParam(stepperData, stepQueryParam) ?? stepperData[0].index

  const setCurrentStepIndex = useCallback(
    (stepIndex: FormStepIndex, options?: Options) =>
      setStepQueryParam(getQueryParamByStepIndex(stepperData, stepIndex), options),
    [stepperData, setStepQueryParam],
  )

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
