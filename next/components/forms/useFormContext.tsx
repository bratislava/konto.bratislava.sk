import { FormBaseFragment } from '@clients/graphql-strapi/api'
import { GenericObjectType } from '@rjsf/utils'
import {
  isSlovenskoSkFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { FormSignature } from 'forms-shared/signer/signature'
import { SummaryJsonForm } from 'forms-shared/summary-json/summaryJsonTypes'
import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import { GetFileResponseReducedDto } from 'openapi-clients/forms'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { useIsSSR } from 'react-aria'

import { useSsrAuth } from '../../frontend/hooks/useSsrAuth'
import { SerializableFormDefinition } from './serializableFormDefinition'

declare global {
  interface Window {
    __DEV_ALLOW_IMPORT_EXPORT_JSON?: () => void
  }
}

export type FormServerContext = {
  formDefinition: SerializableFormDefinition
  formId: string
  initialFormDataJson: GenericObjectType
  initialServerFiles: GetFileResponseReducedDto[]
  initialSignature?: FormSignature | null
  initialSummaryJson?: SummaryJsonForm | null
  initialFormSent: boolean
  formMigrationRequired: boolean
  isEmbedded: boolean
  isDevRoute?: boolean
  strapiForm: FormBaseFragment | null
  versionCompareContinueAction: VersionCompareContinueAction
}

const useGetContext = (formServerContext: FormServerContext) => {
  const isSSR = useIsSSR()
  const { isSignedIn, tierStatus } = useSsrAuth()

  const { formDefinition, formMigrationRequired, initialFormSent, isEmbedded } = formServerContext

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
    if (!isSSR) {
      // eslint-disable-next-line no-underscore-dangle
      window.__DEV_ALLOW_IMPORT_EXPORT_JSON = () => setJsonImportExportAllowed(true)
    }
  }, [isSSR, setJsonImportExportAllowed])

  const isReadonly = formMigrationRequired
  const isDeletable = formMigrationRequired && !initialFormSent

  const isTaxForm = isSlovenskoSkTaxFormDefinition(formDefinition)

  const isSigned = isSlovenskoSkFormDefinition(formDefinition) && formDefinition.isSigned

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
