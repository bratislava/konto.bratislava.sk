import { RJSFSchema, UiSchema } from '@rjsf/utils'
import { useRouter } from 'next/router'
import React from 'react'

import { InitialFormData } from '../../frontend/types/initialFormData'
import AccountPageLayout from '../layouts/AccountPageLayout'
import PageWrapper from '../layouts/PageWrapper'
import { GetSSRCurrentAuth } from '../logic/ServerSideAuthProvider'
import FormPage from './FormPage'
import { FormStateProvider } from './FormStateProvider'
import { FormFileUploadStateProvider } from './useFormFileUpload'
import { FormModalsProvider } from './useFormModals'
import { FormExportImportProvider } from '../../frontend/hooks/useFormExportImport'

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
    </PageWrapper>
  )
}

export default FormPageWrapper
