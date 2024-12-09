import React, { PropsWithChildren } from 'react'

import { FormExportImportProvider } from '../../frontend/hooks/useFormExportImport'
import { FormSignatureProvider } from './signer/useFormSignature'
import { FormSignerLoaderProvider } from './signer/useFormSignerLoader'
import { FormSummaryProvider } from './steps/Summary/useFormSummary'
import { FormContextProvider, FormServerContext } from './useFormContext'
import { FormDataProvider } from './useFormData'
import { FormFileUploadProvider } from './useFormFileUpload'
import { FormLeaveProtectionProvider } from './useFormLeaveProtection'
import { FormModalsProvider } from './useFormModals'
import { FormRedirectsProvider } from './useFormRedirects'
import { FormSendProvider } from './useFormSend'
import { FormStateProvider } from './useFormState'
import { FormValidatorRegistryProvider } from './useFormValidatorRegistry'

type FormProvidersProps = {
  formServerContext: FormServerContext
}

const FormProviders = ({ formServerContext, children }: PropsWithChildren<FormProvidersProps>) => {
  return (
    <FormValidatorRegistryProvider>
      <FormContextProvider formServerContext={formServerContext}>
        <FormFileUploadProvider>
          <FormLeaveProtectionProvider>
            <FormModalsProvider>
              <FormSignerLoaderProvider>
                <FormDataProvider>
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
                </FormDataProvider>
              </FormSignerLoaderProvider>
            </FormModalsProvider>
          </FormLeaveProtectionProvider>
        </FormFileUploadProvider>
      </FormContextProvider>
    </FormValidatorRegistryProvider>
  )
}

export default FormProviders
