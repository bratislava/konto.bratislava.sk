import { GetFileResponseReducedDto } from '@clients/openapi-forms'
import { GenericObjectType } from '@rjsf/utils'
import {
  FormDefinition,
  isSlovenskoSkFormDefinition,
  isSlovenskoSkGenericFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { ClientFileInfo } from 'forms-shared/form-files/fileStatus'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { useIsClient } from 'usehooks-ts'

import { useSsrAuth } from '../../frontend/hooks/useSsrAuth'
import type { FormSignature } from './signer/useFormSignature'

declare global {
  interface Window {
    __DEV_ALLOW_IMPORT_EXPORT_JSON?: () => void
  }
}

export type FormContext = {
  formDefinition: FormDefinition
  formId: string
  initialFormDataJson: GenericObjectType
  initialClientFiles?: ClientFileInfo[]
  initialServerFiles: GetFileResponseReducedDto[]
  initialSignature?: FormSignature | null
  formSent: boolean
  formMigrationRequired: boolean
  isEmbedded: boolean
  isDevRoute?: boolean
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

  const isClient = useIsClient()
  const { isSignedIn, tierStatus } = useSsrAuth()
  const { eIdTaxFormAllowed } = useSsrAuth()

  const { formDefinition, formMigrationRequired, formSent, isEmbedded } = context

  const requiresVerification = isSlovenskoSkGenericFormDefinition(formDefinition)
  const verificationMissing = requiresVerification && !tierStatus.isIdentityVerified

  const requiresSignIn = isSlovenskoSkGenericFormDefinition(formDefinition)
  const signInMissing = requiresSignIn && !isSignedIn

  const displayHeaderAndMenu = !isEmbedded

  const xmlImportExportAllowed = isSlovenskoSkFormDefinition(formDefinition)
  const [jsonImportExportAllowed, setJsonImportExportAllowed] = useState(
    !isSlovenskoSkFormDefinition(formDefinition),
  )

  // Until terms and conditions are in landing page we cannot allow PDF download from menu as tax PDF with PII is stored
  const pdfDownloadInMenuAllowed = !isSlovenskoSkTaxFormDefinition(formDefinition)

  useEffect(() => {
    // Dev only debugging feature
    if (isClient) {
      // eslint-disable-next-line no-underscore-dangle
      window.__DEV_ALLOW_IMPORT_EXPORT_JSON = () => setJsonImportExportAllowed(true)
    }
  }, [isClient, setJsonImportExportAllowed])

  const isReadonly = formMigrationRequired || formSent
  const isDeletable = formMigrationRequired && !formSent

  const isTaxForm = isSlovenskoSkTaxFormDefinition(context.formDefinition)

  const isSigned =
    isSlovenskoSkFormDefinition(formDefinition) &&
    formDefinition.isSigned &&
    // Temporary feature toggle for eID tax form
    eIdTaxFormAllowed

  return {
    ...context,
    verificationMissing,
    signInMissing,
    displayHeaderAndMenu,
    xmlImportExportAllowed,
    jsonImportExportAllowed,
    pdfDownloadInMenuAllowed,
    isTaxForm,
    isSigned,
    isReadonly,
    isDeletable,
  }
}
