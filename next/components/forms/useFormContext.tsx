import { GenericObjectType } from '@rjsf/utils'
import { evaluateFormSendPolicy, SendPolicyAccountType } from 'forms-shared/send-policy/sendPolicy'
import { FormSignature } from 'forms-shared/signer/signature'
import { SummaryJsonForm } from 'forms-shared/summary-json/summaryJsonTypes'
import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import { GetFileResponseReducedDto } from 'openapi-clients/forms'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { useIsSSR } from 'react-aria'

import { FormBaseFragment } from '@/clients/graphql-strapi/api'
import { useSsrAuth } from '@/frontend/hooks/useSsrAuth'

import {
  ClientFormDefinition,
  isClientSlovenskoSkFormDefinition,
  isClientSlovenskoSkTaxFormDefinition,
} from './clientFormDefinitions'

declare global {
  interface Window {
    __DEV_ALLOW_IMPORT_EXPORT_JSON?: () => void
  }
}

export type FormServerContext = {
  formDefinition: ClientFormDefinition
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

  const getSendPolicyAccountType = () => {
    if (!isSignedIn) {
      return SendPolicyAccountType.NotAuthenticated
    }

    if (tierStatus.isIdentityVerified) {
      return SendPolicyAccountType.AuthenticatedVerified
    }

    return SendPolicyAccountType.AuthenticatedNotVerified
  }

  const evaluatedSendPolicy = evaluateFormSendPolicy(
    formDefinition.sendPolicy,
    getSendPolicyAccountType(),
  )

  const displayHeaderAndMenu = !isEmbedded

  const xmlImportExportAllowed = isClientSlovenskoSkFormDefinition(formDefinition)
  const [jsonImportExportAllowed, setJsonImportExportAllowed] = useState(
    !isClientSlovenskoSkFormDefinition(formDefinition),
  )

  // Until terms and conditions are in landing page we cannot allow PDF download from menu as tax PDF with PII is stored
  const pdfDownloadInMenuAllowed = !isClientSlovenskoSkTaxFormDefinition(formDefinition)

  useEffect(() => {
    // Dev only debugging feature
    if (!isSSR) {
      // eslint-disable-next-line no-underscore-dangle
      window.__DEV_ALLOW_IMPORT_EXPORT_JSON = () => setJsonImportExportAllowed(true)
    }
  }, [isSSR, setJsonImportExportAllowed])

  const isReadonly = formMigrationRequired
  const isDeletable = formMigrationRequired && !initialFormSent

  const isTaxForm = isClientSlovenskoSkTaxFormDefinition(formDefinition)

  const isSigned = isClientSlovenskoSkFormDefinition(formDefinition) && formDefinition.isSigned

  return {
    ...formServerContext,
    evaluatedSendPolicy,
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
