import { formsApi } from '@clients/forms'
import { GetFormResponseDtoStateEnum } from '@clients/openapi-forms'
import { isAxiosError } from 'axios'
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

export const getServerSideProps: GetServerSideProps<FormPageWrapperProps, Params> = async (ctx) => {
  if (!environment.featureToggles.forms || !ctx.params) return { notFound: true }

  const { slug, id } = ctx.params

  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)

  try {
    const [form, files] = await Promise.all([
      formsApi
        .nasesControllerGetForm(id, {
          accessToken: 'onlyAuthenticated',
          accessTokenSsrReq: ctx.req,
        })
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
      /* If there wouldn't be this check it would be possible to open the page with any slug in the URL. */
      form.schemaVersion.schema?.slug !== slug
    ) {
      return { notFound: true }
    }

    const formSent = form.state !== GetFormResponseDtoStateEnum.Draft
    // necessary for page wrappers common for entire web
    const locale = ctx.locale ?? 'sk'

    return {
      props: {
        schema: form.schemaVersion.jsonSchema,
        uiSchema: form.schemaVersion.uiSchema,
        ssrCurrentAuthProps,
        page: {
          locale,
        },
        initialFormData: {
          formId: id,
          formDataJson: form.formDataJson ?? {},
          files,
          oldSchemaVersion: !form.isLatestSchemaVersionForSlug,
          formSent,
          routeWithId: true,
        },
        ...(await serverSideTranslations(locale)),
      } satisfies FormPageWrapperProps,
    }
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        return { notFound: true }
      }
      if (error.response?.status === 401) {
        return {
          redirect: {
            destination: '/prihlasenie',
            permanent: false,
          },
        }
      }
    }

    throw error
  }
}

export default ServerSideAuthProviderHOC(FormPageWrapper)
