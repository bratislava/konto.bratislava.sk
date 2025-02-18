import { useDeepMemo } from '@react-aria/utils'
import { useFormData } from 'components/forms/useFormData'
import {
  FileStatusType,
  isInfectedFileStatusType,
  isScanFileStatusType,
  isUploadFileStatusType,
} from 'forms-shared/form-files/fileStatus'
import { mergeClientAndServerFilesSummary } from 'forms-shared/form-files/mergeClientAndServerFiles'
import { ValidatedSummary, validateSummary } from 'forms-shared/summary-renderer/validateSummary'
import isEqual from 'lodash/isEqual'
import memoizeOne from 'memoize-one'
import React, { createContext, PropsWithChildren, useCallback, useContext } from 'react'

import { environment } from '../../../../environment'
import { useFormContext } from '../../useFormContext'
import { useFormFileUpload } from '../../useFormFileUpload'
import { useFormState } from '../../useFormState'
import { useFormValidatorRegistry } from '../../useFormValidatorRegistry'

const memoizedValidateSummary = memoizeOne(validateSummary)

const useCreateGetFilesByStatusType = (
  getValidatedSummary: () => ValidatedSummary,
  statusTypeChecker: (statusType: FileStatusType) => boolean,
) => {
  return useCallback(
    () =>
      getValidatedSummary().filesInFormData.filter((file) => statusTypeChecker(file.statusType)),
    [getValidatedSummary, statusTypeChecker],
  )
}

/**
 * This includes many optimizations as `validateSummary` is expensive (takes hundreds of milliseconds).
 */
const useGetContext = () => {
  const {
    formDefinition: { schema },
  } = useFormContext()
  const { formData } = useFormData()
  const { currentStepIndex } = useFormState()
  const validatorRegistry = useFormValidatorRegistry()

  const { clientFiles, serverFiles } = useFormFileUpload()
  // Don't use directly!
  const fileInfosNotMemoized = mergeClientAndServerFilesSummary(clientFiles, serverFiles)
  // This is an important optimization, when:
  //  - user uploads a file, on each `onProgress` upload event a new object is created (this happens very often),
  //  - server files are polled (this happens every 5 seconds),
  // the file infos don't change by value, but a new object is created, it causes to unnecessarily call `validateSummary`.
  const fileInfos = useDeepMemo(fileInfosNotMemoized, isEqual)

  // The following variables use `useCallback` instead of `useMemo` to do the computation only when "needed on the screen".
  // Also, the memoized version (it computes only once for equal arguments) of `validateSummary` is used. If we would have
  // had used `useMemo` it wouldn't be needed, but `useCallback` doesn't cache its results and is called multiple times
  // during the render.
  const getValidatedSummary = useCallback(
    (precalculate?: boolean) => {
      // This function should be absolutely never called on screen containing an editable form, it would mean the summary
      // is computed for every form data change. Only exception is when called by `precalculateSummary`.
      if (
        environment.nodeEnv === 'development' &&
        !precalculate &&
        currentStepIndex !== 'summary'
      ) {
        throw new Error('getValidatedSummary should never be called on a form step')
      }

      return memoizedValidateSummary({ schema, formData, fileInfos, validatorRegistry })
    },
    [formData, schema, fileInfos, currentStepIndex, validatorRegistry],
  )

  const getInfectedFiles = useCreateGetFilesByStatusType(
    getValidatedSummary,
    isInfectedFileStatusType,
  )
  const getUploadFiles = useCreateGetFilesByStatusType(getValidatedSummary, isUploadFileStatusType)
  const getScanFiles = useCreateGetFilesByStatusType(getValidatedSummary, isScanFileStatusType)

  // When user opens stepper on mobile or hovers on summary step, it's a good idea to precalculate the summary.
  const precalculateSummary = () => {
    setTimeout(() => {
      getValidatedSummary(true)
    }, 0)
  }

  return {
    precalculateSummary,
    getValidatedSummary,
    getInfectedFiles,
    getUploadFiles,
    getScanFiles,
    fileInfos,
  }
}

const FormSummaryContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormSummaryProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return <FormSummaryContext.Provider value={context}>{children}</FormSummaryContext.Provider>
}

export const useFormSummary = () => {
  const context = useContext(FormSummaryContext)
  if (!context) {
    throw new Error('useFormSummary must be used within a FormSummaryProvider')
  }

  return context
}
