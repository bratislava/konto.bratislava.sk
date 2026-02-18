import React, { PropsWithChildren } from 'react'

import { FormSignatureProvider } from '@/components/forms/signer/useFormSignature'
import { FormSignerLoaderProvider } from '@/components/forms/signer/useFormSignerLoader'
import { FormSummaryProvider } from '@/components/forms/steps/Summary/useFormSummary'
import { FormDataProvider } from '@/components/forms/useFormData'
import { FormFileUploadProvider } from '@/components/forms/useFormFileUpload'
import { FormLeaveProtectionProvider } from '@/components/forms/useFormLeaveProtection'
import { FormModalsProvider } from '@/components/forms/useFormModals'
import { FormRedirectsProvider } from '@/components/forms/useFormRedirects'
import { FormSendProvider } from '@/components/forms/useFormSend'
import { FormStateProvider } from '@/components/forms/useFormState'
import { FormValidatorRegistryProvider } from '@/components/forms/useFormValidatorRegistry'
import { FormExportImportProvider } from '@/frontend/hooks/useFormExportImport'

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
