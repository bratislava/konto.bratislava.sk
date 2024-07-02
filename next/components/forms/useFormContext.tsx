import { GetFileResponseReducedDto } from '@clients/openapi-forms'
import { GenericObjectType } from '@rjsf/utils'
import {
  FormDefinition,
  isSlovenskoSkGenericFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { ClientFileInfo } from 'forms-shared/form-files/fileStatus'
import { createContext, PropsWithChildren, useContext } from 'react'

import { useSsrAuth } from '../../frontend/hooks/useSsrAuth'
import type { FormSignature } from './signer/useFormSignature'

export type FormContext = {
  formDefinition: FormDefinition
  formId: string
  initialFormDataJson: GenericObjectType
  initialClientFiles?: ClientFileInfo[]
  initialServerFiles: GetFileResponseReducedDto[]
  initialSignature?: FormSignature | null
  formSent: boolean
  formMigrationRequired: boolean
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
  const isTaxForm = isSlovenskoSkTaxFormDefinition(context.formDefinition)
  const { eIdTaxFormAllowed } = useSsrAuth()
  const { formMigrationRequired, formSent } = context
  const isReadonly = formMigrationRequired || formSent
  const isDeletable = formMigrationRequired && !formSent
  const isSigned =
    isSlovenskoSkGenericFormDefinition(context.formDefinition) &&
    context.formDefinition.isSigned &&
    eIdTaxFormAllowed

  return { ...context, isTaxForm, isSigned, isReadonly, isDeletable }
}
