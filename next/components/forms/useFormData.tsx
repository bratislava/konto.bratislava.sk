import { GenericObjectType } from '@rjsf/utils'
import React, { createContext, PropsWithChildren, useContext } from 'react'
import useStateRef from 'react-usestateref'

import { useFormContext } from '@/components/forms/useFormContext'

const useGetContext = () => {
  const { initialFormDataJson } = useFormContext()
  const [formData, setFormData, formDataRef] = useStateRef<GenericObjectType>(initialFormDataJson)

  return {
    formData,
    formDataRef,
    setFormData,
  }
}

export const FormDataContext = createContext<ReturnType<typeof useGetContext> | undefined>(
  undefined,
)

export const FormDataProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return <FormDataContext.Provider value={context}>{children}</FormDataContext.Provider>
}

export const useFormData = () => {
  const context = useContext(FormDataContext)
  if (!context) {
    throw new Error('useFormState must be used within a FormStateProvider')
  }

  return context
}
