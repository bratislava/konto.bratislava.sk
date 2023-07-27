import { formsApi } from '@clients/forms'
import { GetFileResponseDto } from '@clients/openapi-forms'
import { ErrorSchema } from '@rjsf/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { validateSummary } from '../../../../frontend/dtos/formStepperDto'
import { FormFileUploadFileInfo } from '../../../../frontend/types/formFileUploadTypes'
import { useFormState } from '../../FormStateProvider'
import { useFormFileUpload } from '../../useFormFileUpload'

type FormSummaryContextType = {
  errorSchema: ErrorSchema
  infectedFiles: FormFileUploadFileInfo[]
  scanningFiles: FormFileUploadFileInfo[]
  scanErrorFiles: FormFileUploadFileInfo[]
  fieldHasError: (fieldId: string) => boolean
}

const FormSummaryContext = createContext<FormSummaryContextType | undefined>(undefined)

function checkPathForErrors(fieldId: string, errorSchema: ErrorSchema) {
  const fieldIdComponents = fieldId.split('_').slice(1)

  let current: ErrorSchema | undefined = errorSchema

  // Traverse the schema according to the path
  // eslint-disable-next-line no-restricted-syntax
  for (const component of fieldIdComponents) {
    if ((current as ErrorSchema)[component] === undefined) {
      // If a component of the path is not found in the schema, return false
      return false
    }
    current = (current as ErrorSchema)[component]
  }

  // Check if the final component in the path or any of its children has errors
  return true
}

export const FormSummaryProvider = ({ children }: PropsWithChildren) => {
  const { formData, schemaWithDefinitions } = useFormState()
  const { getFileInfoById } = useFormFileUpload()

  const validatedSummary = useMemo(
    () => validateSummary(schemaWithDefinitions, formData, getFileInfoById),
    [formData, schemaWithDefinitions, getFileInfoById],
  )

  const fieldHasError = (fieldId: string) =>
    checkPathForErrors(fieldId, validatedSummary.errorSchema)

  const context = {
    ...validatedSummary,
    fieldHasError,
  }

  return <FormSummaryContext.Provider value={context}>{children}</FormSummaryContext.Provider>
}

export const useFormSummary = (): FormSummaryContextType => {
  const context = useContext<FormSummaryContextType | undefined>(FormSummaryContext)
  if (!context) {
    throw new Error('useFormSummary must be used within a FormSummaryProvider')
  }

  return context
}
