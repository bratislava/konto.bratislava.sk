import { useRouter } from 'next/router'
import { usePlausible } from 'next-plausible'
import React, { useEffect } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { FormExportImportProvider } from '../../frontend/hooks/useFormExportImport'
import AccountPageLayout from '../layouts/AccountPageLayout'
import { GetSSRCurrentAuth } from '../logic/ServerSideAuthProvider'
import FormPage from './FormPage'
import ThankYouFormSection from './segments/AccountSections/ThankYouSection/ThankYouFormSection'
import { FormSignatureProvider } from './signer/useFormSignature'
import { FormSignerLoaderProvider } from './signer/useFormSignerLoader'
import { FormContext, FormContextProvider } from './useFormContext'
import { FormFileUploadProvider } from './useFormFileUpload'
import { FormLeaveProtectionProvider } from './useFormLeaveProtection'
import { FormModalsProvider } from './useFormModals'
import { FormRedirectsProvider } from './useFormRedirects'
import { FormSendProvider } from './useFormSend'
import { FormSentRenderer } from './useFormSent'
import { FormStateProvider } from './useFormState'

export type FormPageWrapperProps = {
  formContext: FormContext
  ssrCurrentAuthProps?: GetSSRCurrentAuth
}

// custom plausible tracking - we exclude '/mestske-sluzby/*/*' in top level plausible provider
// instead, we track these as custom events: formSlug#hash
const useCustomPlausibleFormPagesTracking = (formSlug: string) => {
  const router = useRouter()
  const plausible = usePlausible()

  useEffect(() => {
    const onHashChangeStart = (url: string) => {
      const hash = url.split('#')[1]
      plausible(`${formSlug}#${hash}`)
    }

    router.events.on('hashChangeStart', onHashChangeStart)

    return () => {
      router.events.off('hashChangeStart', onHashChangeStart)
    }
  }, [formSlug, plausible, router.events])

  // track initial pageview
  useEffectOnce(() => {
    const hash = router.asPath.split('#')[1]
    plausible(`${formSlug}#${hash}`)
  })
}

const FormPageWrapper = ({ formContext }: FormPageWrapperProps) => {
  useCustomPlausibleFormPagesTracking(formContext.slug)

  return (
    <FormContextProvider formContext={formContext}>
      <FormSentRenderer
        // TODO today it does not make sense to have anything else than false in initialFormSent - otherwise we just display "thank you" page on each revisit
        // if it stays this way remove the prop completely
        initialFormSent={false}
        notSentChildren={
          <FormFileUploadProvider>
            <FormLeaveProtectionProvider>
              <FormModalsProvider>
                <FormSignerLoaderProvider>
                  <FormStateProvider>
                    <FormRedirectsProvider>
                      <FormSignatureProvider>
                        <FormSendProvider>
                          <FormExportImportProvider>
                            <AccountPageLayout>
                              <FormPage />
                            </AccountPageLayout>
                          </FormExportImportProvider>
                        </FormSendProvider>
                      </FormSignatureProvider>
                    </FormRedirectsProvider>
                  </FormStateProvider>
                </FormSignerLoaderProvider>
              </FormModalsProvider>
            </FormLeaveProtectionProvider>
          </FormFileUploadProvider>
        }
        sentChildren={
          <AccountPageLayout hiddenHeaderNav className="bg-gray-50">
            <ThankYouFormSection />
          </AccountPageLayout>
        }
      />
    </FormContextProvider>
  )
}

export default FormPageWrapper
