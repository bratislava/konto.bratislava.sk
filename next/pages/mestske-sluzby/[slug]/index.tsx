import { formsApi } from '@clients/forms'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import FormPageWrapper, { FormPageWrapperProps } from '../../../components/forms/FormPageWrapper'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from '../../../components/logic/ServerSideAuthProvider'
import { environment } from '../../../environment'

type Params = {
  slug: string
}

// TODO: Error handling
export const getServerSideProps: GetServerSideProps<FormPageWrapperProps, Params> = async (ctx) => {
  if (!environment.featureToggles.forms || !ctx.params) return { notFound: true }

  const { slug } = ctx.params

  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)

  const schema = await formsApi.schemasControllerGetSchema(slug, {
    accessToken: 'onlyAuthenticated',
    accessTokenSsrReq: ctx.req,
  })
  const { latestVersionId, latestVersion } = schema.data
  if (!latestVersionId || !latestVersion) {
    return {
      notFound: true,
    }
  }

  const form = await formsApi
    .nasesControllerCreateForm(
      {
        schemaVersionId: latestVersionId,
      },
      { accessToken: 'onlyAuthenticated', accessTokenSsrReq: ctx.req },
    )
    .then((res) => res.data)

  if (!form) {
    return { notFound: true }
  }

  // necessary for page wrappers common for entire web
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      schema: latestVersion.jsonSchema,
      uiSchema: latestVersion.uiSchema,
      ssrCurrentAuthProps,
      page: {
        locale,
      },
      initialFormData: {
        formId: form.id,
        formDataJson: form.formDataJson ?? {},
        files: [],
      },
      ...(await serverSideTranslations(locale)),
    } satisfies FormPageWrapperProps,
  }
}

export default ServerSideAuthProviderHOC(FormPageWrapper)
