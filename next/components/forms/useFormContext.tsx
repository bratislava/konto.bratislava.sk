import { GetFileResponseDto } from '@clients/openapi-forms'
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import { createContext, PropsWithChildren, useContext } from 'react'

export type FormContext = {
  slug: string
  formId: string
  schema: RJSFSchema
  uiSchema: UiSchema
  initialFormDataJson: GenericObjectType
  initialServerFiles: GetFileResponseDto[]
  oldSchemaVersion: boolean
  formSent: boolean
  formMigrationRequired: boolean
  schemaVersionId: string
  isSigned: boolean
  isTaxForm: boolean
}

const FormContextContext = createContext<FormContext | undefined>(undefined)

type FormContextProviderProps = {
  formContext: FormContext
}
export const FormContextProvider = ({
  formContext,
  children,
}: PropsWithChildren<FormContextProviderProps>) => {
  return <FormContextContext.Provider value={formContext}>{children}</FormContextContext.Provider>
}

export const useFormContext = () => {
  const context = useContext(FormContextContext)
  if (!context) {
    throw new Error('useFormContext must be used within a FormContextProvider')
  }

  return context
}
