import { useDeepMemo } from '@react-aria/utils'
import {
  FileStatusType,
  isInfectedFileStatusType,
  isScanFileStatusType,
  isUploadFileStatusType,
} from 'forms-shared/form-files/fileStatus'
import { mergeClientAndServerFilesSummary } from 'forms-shared/form-files/mergeClientAndServerFiles'
import { ValidatedSummary, validateSummary } from 'forms-shared/summary-renderer/validateSummary'
import isEqual from 'lodash/isEqual'
import React, { createContext, PropsWithChildren, useCallback, useContext } from 'react'

import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormData } from '@/src/components/forms/useFormData'
import { useFormFileUpload } from '@/src/components/forms/useFormFileUpload'
import { useFormState } from '@/src/components/forms/useFormState'
import { useFormValidatorRegistry } from '@/src/components/forms/useFormValidatorRegistry'
import { environment } from '@/src/environment'

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
 * The first `validateSummary` call compiles the whole form schema (takes hundreds of milliseconds), the following calls
 * reuse the compiled validator from the registry and take a few milliseconds.
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
  // When:
  //  - user uploads a file, on each `onProgress` upload event a new object is created (this happens very often),
  //  - server files are polled (this happens every 5 seconds),
  // the file infos don't change by value, but a new object is created. Keeping the same object keeps `fileInfos` and
  // `getValidatedSummary` stable for the summary components.
  const fileInfos = useDeepMemo(fileInfosNotMemoized, isEqual)

  // The following variables use `useCallback` instead of `useMemo` to do the computation only when "needed on the screen".
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

      return validateSummary({ schema, formData, fileInfos, validatorRegistry })
    },
    [formData, schema, fileInfos, currentStepIndex, validatorRegistry],
  )

  const getInfectedFiles = useCreateGetFilesByStatusType(
    getValidatedSummary,
    isInfectedFileStatusType,
  )
  const getUploadFiles = useCreateGetFilesByStatusType(getValidatedSummary, isUploadFileStatusType)
  const getScanFiles = useCreateGetFilesByStatusType(getValidatedSummary, isScanFileStatusType)

  // When user opens stepper on mobile or hovers on summary step, it's a good idea to precalculate the summary, so the
  // form schema is already compiled when the summary is opened.
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
