import React, { PropsWithChildren } from 'react'

import { FormSignatureProvider } from '@/src/components/forms/signer/useFormSignature'
import { FormSignerLoaderProvider } from '@/src/components/forms/signer/useFormSignerLoader'
import { FormSummaryProvider } from '@/src/components/forms/steps/Summary/useFormSummary'
import { FormDataProvider } from '@/src/components/forms/useFormData'
import { FormFileUploadProvider } from '@/src/components/forms/useFormFileUpload'
import { FormLeaveProtectionProvider } from '@/src/components/forms/useFormLeaveProtection'
import { FormRedirectsProvider } from '@/src/components/forms/useFormRedirects'
import { FormSendProvider } from '@/src/components/forms/useFormSend'
import { FormStateProvider } from '@/src/components/forms/useFormState'
import { FormValidatorRegistryProvider } from '@/src/components/forms/useFormValidatorRegistry'
import { FormModalsProvider } from '@/src/components/modals/FormModals/useFormModals'
import { FormExportImportProvider } from '@/src/frontend/hooks/useFormExportImport'

const FormProviders = ({ children, nonce }: PropsWithChildren<{ nonce?: string }>) => {
  return (
    <FormValidatorRegistryProvider>
      <FormFileUploadProvider>
        <FormLeaveProtectionProvider>
          <FormModalsProvider>
            <FormSignerLoaderProvider nonce={nonce}>
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
