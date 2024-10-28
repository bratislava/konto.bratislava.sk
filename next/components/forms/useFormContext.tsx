import { FormBaseFragment } from '@clients/graphql-strapi/api'
import { GetFileResponseReducedDto } from '@clients/openapi-forms'
import { GenericObjectType } from '@rjsf/utils'
import {
  isSlovenskoSkFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { ClientFileInfo } from 'forms-shared/form-files/fileStatus'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { useIsClient } from 'usehooks-ts'

import { useSsrAuth } from '../../frontend/hooks/useSsrAuth'
import { SerializableFormDefinition } from './serializableFormDefinition'
import type { FormSignature } from './signer/useFormSignature'

declare global {
  interface Window {
    __DEV_ALLOW_IMPORT_EXPORT_JSON?: () => void
  }
}

export type FormServerContext = {
  formDefinition: SerializableFormDefinition
  formId: string
  initialFormDataJson: GenericObjectType
  initialClientFiles?: ClientFileInfo[]
  initialServerFiles: GetFileResponseReducedDto[]
  initialSignature?: FormSignature | null
  formSent: boolean
  formMigrationRequired: boolean
  isEmbedded: boolean
  isDevRoute?: boolean
  strapiForm: FormBaseFragment | null
}

const useGetContext = (formServerContext: FormServerContext) => {
  const isClient = useIsClient()
  const { isSignedIn, tierStatus } = useSsrAuth()
  const { eIdTaxFormAllowed } = useSsrAuth()

  const { formDefinition, formMigrationRequired, formSent, isEmbedded } = formServerContext

  // TODO: Revisit this logic
  const requiresVerification =
    !formDefinition.allowSendingUnauthenticatedUsers &&
    !isSlovenskoSkTaxFormDefinition(formDefinition)
  const verificationMissing = requiresVerification && !tierStatus.isIdentityVerified

  // TODO: Revisit this logic
  const requiresSignIn =
    !formDefinition.allowSendingUnauthenticatedUsers &&
    !isSlovenskoSkTaxFormDefinition(formDefinition)
  const signInMissing = requiresSignIn && !isSignedIn

  // TODO: Revisit this logic
  const sendWithEidAllowed = isSlovenskoSkFormDefinition(formDefinition)

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

  const isTaxForm = isSlovenskoSkTaxFormDefinition(formDefinition)

  const isSigned =
    isSlovenskoSkFormDefinition(formDefinition) &&
    formDefinition.isSigned &&
    // Temporary feature toggle for eID tax form
    eIdTaxFormAllowed

  return {
    ...formServerContext,
    verificationMissing,
    signInMissing,
    sendWithEidAllowed,
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

const FormContextContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

type FormContextProviderProps = {
  formServerContext: FormServerContext
}
export const FormContextProvider = ({
  formServerContext,
  children,
}: PropsWithChildren<FormContextProviderProps>) => {
  const context = useGetContext(formServerContext)
  return <FormContextContext.Provider value={context}>{children}</FormContextContext.Provider>
}

export const useFormContext = () => {
  const context = useContext(FormContextContext)
  if (!context) {
    throw new Error('useFormContext must be used within a FormContextProvider')
  }

  return context
}
