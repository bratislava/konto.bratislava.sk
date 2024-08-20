import React, { PropsWithChildren } from 'react'

import { FormExportImportProvider } from '../../frontend/hooks/useFormExportImport'
import { FormSignatureProvider } from './signer/useFormSignature'
import { FormSignerLoaderProvider } from './signer/useFormSignerLoader'
import { FormSummaryProvider } from './steps/Summary/useFormSummary'
import { FormContextProvider, FormServerContext } from './useFormContext'
import { FormFileUploadProvider } from './useFormFileUpload'
import { FormLeaveProtectionProvider } from './useFormLeaveProtection'
import { FormModalsProvider } from './useFormModals'
import { FormRedirectsProvider } from './useFormRedirects'
import { FormSendProvider } from './useFormSend'
import { FormStateProvider } from './useFormState'

type FormProvidersProps = {
  formServerContext: FormServerContext
}

const FormProviders = ({ formServerContext, children }: PropsWithChildren<FormProvidersProps>) => {
  return (
    <FormContextProvider formServerContext={formServerContext}>
      <FormFileUploadProvider>
        <FormLeaveProtectionProvider>
          <FormModalsProvider>
            <FormSignerLoaderProvider>
              <FormStateProvider>
                <FormSignatureProvider>
                  <FormRedirectsProvider>
                    <FormSummaryProvider>
                      <FormSendProvider>
                        <FormExportImportProvider>{children}</FormExportImportProvider>
                      </FormSendProvider>
                    </FormSummaryProvider>
                  </FormRedirectsProvider>
                </FormSignatureProvider>
              </FormStateProvider>
            </FormSignerLoaderProvider>
          </FormModalsProvider>
        </FormLeaveProtectionProvider>
      </FormFileUploadProvider>
    </FormContextProvider>
  )
}

export default FormProviders
