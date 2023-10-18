import { RJSFSchema, UiSchema } from '@rjsf/utils'
import { useRouter } from 'next/router'
import React from 'react'

import { FormExportImportProvider } from '../../frontend/hooks/useFormExportImport'
import { InitialFormData } from '../../frontend/types/initialFormData'
import AccountPageLayout from '../layouts/AccountPageLayout'
import PageWrapper from '../layouts/PageWrapper'
import { GetSSRCurrentAuth } from '../logic/ServerSideAuthProvider'
import FormPage from './FormPage'
import ThankYouFormSection from './segments/AccountSections/ThankYouSection/ThankYouFormSection'
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
  page: { locale: string }
  initialFormData: InitialFormData
  ssrCurrentAuthProps?: GetSSRCurrentAuth
}

const FormPageWrapper = ({ schema, uiSchema, page, initialFormData }: FormPageWrapperProps) => {
  const router = useRouter()

  const formSlug = router.query.slug as string

  return (
    <PageWrapper locale={page.locale}>
      <FormSentRenderer
        // TODO today it does not make sense to have anything else than false in initialFormSent - otherwise we just display "thank you" page on each revisit
        // if it stays this way remove the prop completely
        initialFormSent={false}
        notSentChildren={
          <FormComponentProvider formComponent={ThemedForm}>
            <FormFileUploadProvider initialFormData={initialFormData}>
              <FormLeaveProtectionProvider>
                <FormModalsProvider initialFormData={initialFormData}>
                  <FormStateProvider
                    schema={schema}
                    uiSchema={uiSchema}
                    formSlug={formSlug}
                    initialFormData={initialFormData}
                  >
                    <FormRedirectsProvider>
                      <FormSendProvider>
                        <FormExportImportProvider initialFormData={initialFormData}>
                          <AccountPageLayout isPublicPage>
                            <FormPage />
                          </AccountPageLayout>
                        </FormExportImportProvider>
                      </FormSendProvider>
                    </FormRedirectsProvider>
                  </FormStateProvider>
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
    </PageWrapper>
  )
}

export default FormPageWrapper
