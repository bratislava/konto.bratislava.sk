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
import { FormFileUploadStateProvider } from './useFormFileUpload'
import { FormModalsProvider } from './useFormModals'
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
            <FormFileUploadStateProvider initialFormData={initialFormData}>
              <FormStateProvider
                schema={schema}
                uiSchema={uiSchema}
                formSlug={formSlug}
                initialFormData={initialFormData}
              >
                <FormModalsProvider initialFormData={initialFormData}>
                  <FormExportImportProvider>
                    <FormPage />
                  </FormExportImportProvider>
                </FormModalsProvider>
              </FormStateProvider>
            </FormFileUploadStateProvider>
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
