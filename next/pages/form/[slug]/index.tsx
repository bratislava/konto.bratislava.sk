import { formsApi } from '@clients/forms'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import FormPageWrapper, { FormPageWrapperProps } from '../../../components/forms/FormPageWrapper'
import {
  getSSRAccessToken,
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

  const accessToken = await getSSRAccessToken(ctx.req)

  const schema = await formsApi.schemasControllerGetSchema(slug, { accessToken })
  const { latestVersionId } = schema.data
  if (!latestVersionId) {
    return {
      notFound: true,
    }
  }

  const schemaWithData = await formsApi.schemasControllerGetSchemaVersion(latestVersionId, true, {
    accessToken,
  })

  const form = await formsApi
    .nasesControllerCreateForm(
      {
        schemaVersionId: latestVersionId,
      },
      { accessToken },
    )
    .then((res) => res.data)

  if (!form) {
    return { notFound: true }
  }

  // necessary for page wrappers common for entire web
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      schema: schemaWithData.data.jsonSchema,
      uiSchema: schemaWithData.data.uiSchema,
      ssrCurrentAuthProps,
      page: {
        locale,
      },
      initialFormData: {
        formId: form.id,
        // TODO: Fix when BE types are fixed
        formDataJson: (form as unknown as { formDataJson: object }).formDataJson,
        files: [],
      },
      ...(await serverSideTranslations(locale)),
    } satisfies FormPageWrapperProps,
  }
}

export default ServerSideAuthProviderHOC(FormPageWrapper)
