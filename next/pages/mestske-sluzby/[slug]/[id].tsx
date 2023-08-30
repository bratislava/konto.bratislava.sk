import formDefinitions from '@backend/forms'
import { formsApi } from '@clients/forms'
import { GetFormResponseDtoStateEnum } from '@clients/openapi-forms'
import { isAxiosError } from 'axios'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import FormPageWrapper, { FormPageWrapperProps } from '../../../components/forms/FormPageWrapper'
import { getSSRCurrentAuth, ServerSideAuthProviderHOC } from '../../../components/logic/ServerSideAuthProvider'
import { environment } from '../../../environment'
import { ROUTES } from '../../../frontend/api/constants'

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
    const locale = 'sk'
    // If the form was created by an unauthenticated user, a migration modal is displayed and form is not editable.
    const askForFormMigration = Boolean(ssrCurrentAuthProps.userData && !form.userExternalId)

    return {
      props: {
        schema: formDefinitions.test.schema,
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
          askForFormMigration
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
            destination: ROUTES.LOGIN,
            permanent: false,
          },
        }
      }
    }

    throw error
  }
}

export default ServerSideAuthProviderHOC(FormPageWrapper)
