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
    // These promises cannot be run in parallel because the redirects in catch blocks depends on the error response of the first promise.
    const { data: form } = await formsApi.nasesControllerGetForm(id, {
      accessToken: 'onlyAuthenticated',
      accessTokenSsrReq: ctx.req,
    })
    const { data: files } = await formsApi.filesControllerGetFilesStatusByForm(id, {
      accessToken: 'onlyAuthenticated',
      accessTokenSsrReq: ctx.req,
    })

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
    const formMigrationRequired = Boolean(ssrCurrentAuthProps.userData && !form.userExternalId)

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
          formMigrationRequired,
          schemaVersionId: form.schemaVersionId,
        },
        ...(await serverSideTranslations(locale)),
      } satisfies FormPageWrapperProps,
    }
  } catch (error) {
    if (isAxiosError(error)) {
      const is401 = error.response?.status === 401
      const is403 = error.response?.status === 403
      const is404 = error.response?.status === 404
      const isLoggedIn = Boolean(ssrCurrentAuthProps.userData)

      // If logged in user receives 403 for his/her form it's not theirs.
      if (is404 || (is403 && isLoggedIn)) {
        return { notFound: true }
      }
      // If logged out user receives 403 for his/her form it might be theirs.
      if (is401 || (is403 && !isLoggedIn)) {
        return {
          // TODO: Redirect back after login
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
