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
        initialFormSent={initialFormData.formSent}
        notSentChildren={
          <AccountPageLayout isPublicPage hiddenHeaderNav>
            <FormFileUploadProvider initialFormData={initialFormData}>
              <FormLeaveProtectionProvider>
                <FormStateProvider
                  schema={schema}
                  uiSchema={uiSchema}
                  formSlug={formSlug}
                  initialFormData={initialFormData}
                >
                  <FormRedirectsProvider>
                    <FormModalsProvider initialFormData={initialFormData}>
                      <FormSendProvider>
                        <FormExportImportProvider>
                            <FormPage />
                        </FormExportImportProvider>
                      </FormSendProvider>
                    </FormModalsProvider>
                  </FormRedirectsProvider>
                </FormStateProvider>
              </FormLeaveProtectionProvider>
            </FormFileUploadProvider>
          </AccountPageLayout>
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
