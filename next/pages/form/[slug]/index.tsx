import { FormDefinition } from '@backend/forms/types'
import { getFormDefinition } from '@backend/utils/forms'
import { formsApi } from '@clients/forms'
import { GetFileResponseDto } from '@clients/openapi-forms'
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { FormStateProvider } from '../../../components/forms/FormStateProvider'
import GeneratedFormRJSF from '../../../components/forms/GeneratedFormRJSF'
import { FormFileUploadStateProvider } from '../../../components/forms/useFormFileUpload'
import AccountPageLayout from '../../../components/layouts/AccountPageLayout'
import PageWrapper from '../../../components/layouts/PageWrapper'
import {
  getSSRAccessToken,
  GetSSRCurrentAuth,
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from '../../../components/logic/ServerSideAuthProvider'
import { environment } from '../../../environment'
import { InitialFormData } from '../../../frontend/types/initialFormData'
import logger from '../../../frontend/utils/logger'

type Params = {
  slug: string
}

export type FormPageProps = {
  schema: RJSFSchema
  uiSchema: UiSchema
  page: { locale: string }
  initialFormData: InitialFormData
  ssrCurrentAuthProps: GetSSRCurrentAuth
}

export const getServerSideProps: GetServerSideProps<FormPageProps, Params> = async ({
  // locale is necessary for page wrappers common for entire web
  locale = 'sk',
  params,
  req,
}) => {
  if (!environment.featureToggles.forms || !params) {
    return { notFound: true }
  }

  const { slug } = params

  // TODO: Remove and support non-auth version of the page
  const ssrCurrentAuthProps = await getSSRCurrentAuth(req)
  if (!ssrCurrentAuthProps.userData) {
    return {
      redirect: {
        destination: '/prihlasenie',
        permanent: false,
      },
    }
  }

  let formDefinition: FormDefinition
  try {
    formDefinition = getFormDefinition(slug)
  } catch (error) {
    logger.error(error)
    return { notFound: true }
  }

  const accessToken = await getSSRAccessToken(req)
  const getInitialFormData = () => {
    return Promise.all([
      formsApi
        .nasesControllerCreateForm(
          {
            pospID: formDefinition.schema.pospID,
            pospVersion: formDefinition.schema.pospVersion,
            messageSubject: formDefinition.schema.pospID,
            isSigned: false,
            formName: formDefinition.schema.title || formDefinition.schema.pospID,
            fromDescription: formDefinition.schema.description || formDefinition.schema.pospID,
          },
          { accessToken },
        )
        .then((res) => res.data),
      Promise.resolve([] as GetFileResponseDto[]),
    ] as const)
  }

  const [form, files] = await getInitialFormData()

  if (!form) {
    return { notFound: true }
  }

  return {
    props: {
      schema: formDefinition.schema,
      uiSchema: formDefinition.uiSchema,
      ssrCurrentAuthProps,
      page: {
        locale,
      },
      initialFormData: {
        formId: form.id,
        formDataJson: form.formDataJson as GenericObjectType,
        files,
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

const FormPage = ({ schema, uiSchema, page, initialFormData }: FormPageProps) => {
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
            <GeneratedFormRJSF />
          </FormStateProvider>
        </FormFileUploadStateProvider>
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default ServerSideAuthProviderHOC(FormPage)
