import React, { PropsWithChildren } from 'react'

import { FormExportImportProvider } from '../../frontend/hooks/useFormExportImport'
import { FormSignatureProvider } from './signer/useFormSignature'
import { FormSignerLoaderProvider } from './signer/useFormSignerLoader'
import { FormSummaryProvider } from './steps/Summary/useFormSummary'
import { FormDataProvider } from './useFormData'
import { FormFileUploadProvider } from './useFormFileUpload'
import { FormLeaveProtectionProvider } from './useFormLeaveProtection'
import { FormModalsProvider } from './useFormModals'
import { FormRedirectsProvider } from './useFormRedirects'
import { FormSendProvider } from './useFormSend'
import { FormStateProvider } from './useFormState'
import { FormValidatorRegistryProvider } from './useFormValidatorRegistry'

const FormProviders = ({ children }: PropsWithChildren) => {
  return (
    <FormValidatorRegistryProvider>
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
    </FormValidatorRegistryProvider>
  )
}

export default FormProviders
