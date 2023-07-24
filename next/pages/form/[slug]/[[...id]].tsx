import { FormDefinition } from '@backend/forms/types'
import { getFormDefinition } from '@backend/utils/forms'
import { formsApi } from '@clients/forms'
import { GetFileResponseDto } from '@clients/openapi-forms'
import { RJSFSchema, UiSchema } from '@rjsf/utils'
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
  id?: string[]
}

type FormTestPageProps = {
  schema: RJSFSchema
  uiSchema: UiSchema
  page: { locale: string }
  initialFormData: InitialFormData
  ssrCurrentAuthProps: GetSSRCurrentAuth
}

export const getServerSideProps: GetServerSideProps<FormTestPageProps, Params> = async (ctx) => {
  if (!environment.featureToggles.forms || !ctx.params) return { notFound: true }

  const { slug, id: idParams } = ctx.params

  // TODO: Remove and support non-auth version of the page
  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)
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

  const hasIdQueryParam = Array.isArray(idParams)
  const hasOneQueryParam = (property: typeof idParams): property is [string] =>
    Array.isArray(idParams) && idParams.length === 1

  // It is not possible to have only one optional route parameter ([[id]]), so we have to check if it is an array and
  // if it has only one element.
  // TODO: Split into two files.
  if (hasIdQueryParam && !hasOneQueryParam(idParams)) {
    return { notFound: true }
  }
  const id = hasIdQueryParam ? idParams[0] : null

  const accessToken = await getSSRAccessToken(ctx.req)
  const getInitialFormData = () => {
    if (!id) {
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

    return Promise.all([
      formsApi.nasesControllerGetForm(id, { accessToken }).then((res) => res.data),
      formsApi.filesControllerGetFilesStatusByForm(id, { accessToken }).then((res) => res.data),
    ] as const)
  }

  const [form, files] = await getInitialFormData()

  if (!form) {
    return { notFound: true }
  }

  // necessary for page wrappers common for entire web
  const locale = ctx.locale ?? 'sk'

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
        formDataJson: form.formDataJson,
        files,
      },
      ...(await serverSideTranslations(locale)),
    } satisfies FormTestPageProps,
  }
}

const FormTestPage = ({ schema, uiSchema, page, initialFormData }: FormTestPageProps) => {
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

export default ServerSideAuthProviderHOC(FormTestPage)
