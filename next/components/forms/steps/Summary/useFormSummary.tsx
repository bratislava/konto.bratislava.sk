import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react'

import { validateSummary } from '../../../../frontend/utils/form'
import { checkPathForErrors, formHasErrors } from '../../../../frontend/utils/formSummary'
import { useFormContext } from '../../useFormContext'
import { useFormFileUpload } from '../../useFormFileUpload'
import { useFormState } from '../../useFormState'

export type FormSummaryProviderProps = {
  isPdf?: boolean
}

const useGetContext = ({ isPdf }: FormSummaryProviderProps) => {
  const { schema } = useFormContext()
  const { formData } = useFormState()

  const { getFileInfoById } = useFormFileUpload()

  const { errorSchema, infectedFiles, uploadingFiles, scanningFiles } = useMemo(
    () => validateSummary(schema, formData, getFileInfoById),
    [formData, schema, getFileInfoById],
  )
  const hasErrors = formHasErrors(errorSchema)

  const fieldHasError = (fieldId: string) => checkPathForErrors(fieldId, errorSchema)

  return {
    isPdf,
    errorSchema,
    infectedFiles,
    uploadingFiles,
    scanningFiles,
    fieldHasError,
    hasErrors,
  }
}

const FormSummaryContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormSummaryProvider = ({
  children,
  ...props
}: PropsWithChildren<FormSummaryProviderProps>) => {
  const context = useGetContext(props)

  return <FormSummaryContext.Provider value={context}>{children}</FormSummaryContext.Provider>
}

export const useFormSummary = () => {
  const context = useContext(FormSummaryContext)
  if (!context) {
    throw new Error('useFormSummary must be used within a FormSummaryProvider')
  }

  return context
}
