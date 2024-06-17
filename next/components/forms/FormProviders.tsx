import React, { PropsWithChildren } from 'react'

import { FormExportImportProvider } from '../../frontend/hooks/useFormExportImport'
import { FormSignatureProvider } from './signer/useFormSignature'
import { FormSignerLoaderProvider } from './signer/useFormSignerLoader'
import { FormSummaryProvider } from './steps/Summary/useFormSummary'
import { FormContext, FormContextProvider } from './useFormContext'
import { FormFileUploadProvider } from './useFormFileUpload'
import { FormLeaveProtectionProvider } from './useFormLeaveProtection'
import { FormModalsProvider } from './useFormModals'
import { FormRedirectsProvider } from './useFormRedirects'
import { FormSendProvider } from './useFormSend'
import { FormStateProvider } from './useFormState'

type FormProvidersProps = {
  formContext: FormContext
}

const FormProviders = ({ formContext, children }: PropsWithChildren<FormProvidersProps>) => {
  return (
    <FormContextProvider formContext={formContext}>
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
