import { formsApi } from '@clients/forms'
import { SchemaVersionResponseDto } from '@clients/openapi-forms'
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
  id: string
}

// TODO: Error handling
export const getServerSideProps: GetServerSideProps<FormPageWrapperProps, Params> = async (ctx) => {
  if (!environment.featureToggles.forms || !ctx.params) return { notFound: true }

  const { slug, id } = ctx.params

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

  const [form, files] = await Promise.all([
    formsApi
      .nasesControllerGetForm(id, { accessToken: 'onlyAuthenticated', accessTokenSsrReq: ctx.req })
      .then((res) => res.data),
    formsApi
      .filesControllerGetFilesStatusByForm(id, {
        accessToken: 'onlyAuthenticated',
        accessTokenSsrReq: ctx.req,
      })
      .then((res) => res.data),
  ])

  if (
    !form ||
    // TODO: Fix when BE types are fixed
    (form as unknown as { schemaVersion: SchemaVersionResponseDto }).schemaVersion.schema?.slug !==
      slug
  ) {
    return { notFound: true }
  }

  // necessary for page wrappers common for entire web
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      // TODO: Fix when BE types are fixed
      schema: (form as unknown as { schemaVersion: SchemaVersionResponseDto }).schemaVersion
        .jsonSchema,
      uiSchema: (form as unknown as { schemaVersion: SchemaVersionResponseDto }).schemaVersion
        .uiSchema,
      ssrCurrentAuthProps,
      page: {
        locale,
      },
      initialFormData: {
        formId: id,
        // TODO: Fix when BE types are fixed
        formDataJson: (form as unknown as { formDataJson: object }).formDataJson,
        files,
      },
      ...(await serverSideTranslations(locale)),
    } satisfies FormPageWrapperProps,
  }
}

export default ServerSideAuthProviderHOC(FormPageWrapper)
