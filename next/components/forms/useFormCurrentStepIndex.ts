import { JSONSchema7 } from 'json-schema'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useEffectOnceWhen } from 'rooks'

import {
  getFirstNonEmptyStepIndex,
  getStepProperty,
  SUMMARY_HASH,
} from '../../frontend/utils/formState'
import { FormStepIndex } from './types/Steps'

/**
 * Retrieves the query param of a step from provided schema.
 */
const getStepQueryParam = (stepSchema: JSONSchema7 | null) => {
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
 * Retrieves the step index based on provided query param.
 */
const getStepIndexByQueryParam = (
  stepSchemas: (JSONSchema7 | null)[],
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

/**
 * A custom hook that holds the state of the current step index and synchronizes its value with `krok` query param in
 * the URL.
 *
 * This handles:
 * 1. Initially, if the query param in URL is a valid step, it is rendered correctly on server. If not or is missing,
 * the server renders first non-empty step and later the client updates the URL accordingly in initial `useEffectOnceWhen`
 * call.
 * 2. Synchronizes the current step index with the query param in the URL if changed.
 * 3. Synchronizes the query param in the URL with the current step index if changed (exposes the patched version of useState
 * that automatically updates the query param).
 */
export const useFormCurrentStepIndex = (stepSchemas: (JSONSchema7 | null)[]) => {
  const router = useRouter()
  const stepQueryParam = useMemo(() => {
    const { krok } = router.query
    return typeof krok === 'string' ? krok : null
  }, [router.query])

  const [currentStepIndex, setCurrentStepIndex] = useState<FormStepIndex>(
    getStepIndexByQueryParam(stepSchemas, stepQueryParam) ?? getFirstNonEmptyStepIndex(stepSchemas),
  )

  /**
   * Retrieves the current step and updates the query parameter if needed
   */
  const syncStepIndexToQueryParam = useCallback(
    async (index: FormStepIndex, replace: boolean = false) => {
      const newQueryParam =
        index === 'summary' ? SUMMARY_HASH : getStepQueryParam(stepSchemas?.[index])

      if (stepQueryParam === newQueryParam) {
        return
      }

      const routerMethod = replace ? 'replace' : 'push'
      const href = {
        pathname: router.pathname,
        query: { ...router.query, krok: newQueryParam },
      }

      await router[routerMethod](href, href, { shallow: true })
    },
    [router, stepQueryParam, stepSchemas],
  )

  /**
   * Retrieves the current query parameter and updates the step index if needed
   */
  const syncQueryParamToStepIndex = useCallback(async () => {
    const paramStepIndex = getStepIndexByQueryParam(stepSchemas, stepQueryParam)

    if (paramStepIndex != null && paramStepIndex !== currentStepIndex) {
      setCurrentStepIndex(paramStepIndex)
    } else if (paramStepIndex == null) {
      await syncStepIndexToQueryParam(currentStepIndex, true)
    }
  }, [stepSchemas, stepQueryParam, currentStepIndex, syncStepIndexToQueryParam])

  useEffect(() => {
    const handleRouteComplete = () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      syncQueryParamToStepIndex()
    }

    router.events.on('routeChangeComplete', handleRouteComplete)

    return () => {
      router.events.off('routeChangeComplete', handleRouteComplete)
    }
  }, [router.events, syncQueryParamToStepIndex])

  /**
   * Initially syncs the step index to query param, this depends on the default value of `currentStepIndex`
   */
  useEffectOnceWhen(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    syncStepIndexToQueryParam(currentStepIndex, true)
  }, router.isReady)

  /**
   * Patched version of setCurrentStepIndex that also triggers the update of the query param
   */
  const setCurrentStepIndexPatched = (index: FormStepIndex) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    syncStepIndexToQueryParam(index)
    setCurrentStepIndex(index)
  }

  return { currentStepIndex, setCurrentStepIndex: setCurrentStepIndexPatched }
}
