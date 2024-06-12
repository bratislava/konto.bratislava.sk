import { GetFileResponseReducedDto } from '@clients/openapi-forms'
import { ClientFileInfo } from '@forms-shared/form-files/fileStatus'
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import { createContext, PropsWithChildren, useContext } from 'react'

import { useSsrAuth } from '../../frontend/hooks/useSsrAuth'
import type { FormSignature } from './signer/useFormSignature'

export type FormContext = {
  slug: string
  formId: string
  schema: RJSFSchema
  uiSchema: UiSchema
  initialFormDataJson: GenericObjectType
  initialClientFiles?: ClientFileInfo[]
  initialServerFiles: GetFileResponseReducedDto[]
  initialSignature?: FormSignature | null
  oldSchemaVersion: boolean
  formSent: boolean
  formMigrationRequired: boolean
  schemaVersionId: string
  isSigned: boolean
  isTaxForm: boolean
  isPdf?: boolean
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
  const { eIdTaxFormAllowed } = useSsrAuth()
  const { formMigrationRequired, oldSchemaVersion, formSent } = context
  const isReadonly = formMigrationRequired || oldSchemaVersion || formSent
  const isDeletable = (formMigrationRequired || oldSchemaVersion) && !formSent
  const isSigned = context.isSigned && eIdTaxFormAllowed

  return { ...context, isSigned, isReadonly, isDeletable }
}
