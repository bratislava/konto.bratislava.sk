import { RJSFSchema, UiSchema } from '@rjsf/utils'
import { useRouter } from 'next/router'
import { usePlausible } from 'next-plausible'
import React, { useEffect, useRef } from 'react'

import { FormExportImportProvider } from '../../frontend/hooks/useFormExportImport'
import { InitialFormData } from '../../frontend/types/initialFormData'
import AccountPageLayout from '../layouts/AccountPageLayout'
import { GetSSRCurrentAuth } from '../logic/ServerSideAuthProvider'
import FormPage from './FormPage'
import ThankYouFormSection from './segments/AccountSections/ThankYouSection/ThankYouFormSection'
import { FormSignatureProvider } from './signer/useFormSignature'
import { FormSignerLoaderProvider } from './signer/useFormSignerLoader'
import ThemedForm from './ThemedForm'
import { FormComponentProvider } from './useFormComponent'
import { FormFileUploadProvider } from './useFormFileUpload'
import { FormLeaveProtectionProvider } from './useFormLeaveProtection'
import { FormModalsProvider } from './useFormModals'
import { FormRedirectsProvider } from './useFormRedirects'
import { FormSendProvider } from './useFormSend'
import { FormSentRenderer } from './useFormSent'
import { FormStateProvider } from './useFormState'

export type FormPageWrapperProps = {
  schema: RJSFSchema
  uiSchema: UiSchema
  initialFormData: InitialFormData
  ssrCurrentAuthProps?: GetSSRCurrentAuth
}

const matchIdInFormsUrlRegex = /(\/mestske-sluzby\/[^/]+\/)[^#/]+/

// custom plausible tracking - we exclude '/mestske-sluzby/*/*' in top level plausible provider
// instead, we track the url without the UUID
// reference https://plausible.io/docs/custom-locations
const useCustomPlausibleFormPagesTracking = () => {
  const router = useRouter()
  const plausible = usePlausible()
  const firstRender = useRef(true)

  useEffect(() => {
    const onHashChangeStart = (url: string) => {
      const urlWithoutId = url?.replace(matchIdInFormsUrlRegex, '$1ID')
      plausible('pageview', { u: urlWithoutId })
    }

    router.events.on('hashChangeStart', onHashChangeStart)

    return () => {
      router.events.off('hashChangeStart', onHashChangeStart)
    }
  }, [plausible, router.events])

  // track initial pageview
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      const initialUrlWithoutId = router.asPath?.replace(matchIdInFormsUrlRegex, '$1ID')
      // initialUrlWithoutId being undefined should not happen, but better to catch it if it does
      plausible('pageview', { u: initialUrlWithoutId || '/error-in-custom-tracking' })
    }
  }, [router.asPath, plausible])
}

const FormPageWrapper = ({ schema, uiSchema, initialFormData }: FormPageWrapperProps) => {
  useCustomPlausibleFormPagesTracking()

  const router = useRouter()
  const formSlug = router.query.slug as string

  return (
    <FormSentRenderer
      // TODO today it does not make sense to have anything else than false in initialFormSent - otherwise we just display "thank you" page on each revisit
      // if it stays this way remove the prop completely
      initialFormSent={false}
      notSentChildren={
        <FormComponentProvider formComponent={ThemedForm}>
          <FormFileUploadProvider initialFormData={initialFormData}>
            <FormLeaveProtectionProvider>
              <FormModalsProvider initialFormData={initialFormData}>
                <FormSignerLoaderProvider initialFormData={initialFormData}>
                  <FormStateProvider
                    schema={schema}
                    uiSchema={uiSchema}
                    formSlug={formSlug}
                    initialFormData={initialFormData}
                  >
                    <FormRedirectsProvider>
                      <FormSignatureProvider>
                        <FormSendProvider>
                          <FormExportImportProvider initialFormData={initialFormData}>
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
        </FormComponentProvider>
      }
      sentChildren={
        <AccountPageLayout hiddenHeaderNav className="bg-gray-50">
          <ThankYouFormSection />
        </AccountPageLayout>
      }
    />
  )
}

export default FormPageWrapper
