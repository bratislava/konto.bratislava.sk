import { formsApi } from '@clients/forms'
import { GetFormResponseDtoStateEnum } from '@clients/openapi-forms'
import { isAxiosError } from 'axios'

import FormPageWrapper, { FormPageWrapperProps } from '../../../components/forms/FormPageWrapper'
import { SsrAuthProviderHOC } from '../../../components/logic/SsrAuthContext'
import { ROUTES } from '../../../frontend/api/constants'
import { amplifyGetServerSideProps } from '../../../frontend/utils/amplifyServer'
import { getInitialFormSignature } from '../../../frontend/utils/getInitialFormSignature'
import { redirectQueryParam } from '../../../frontend/utils/queryParamRedirect'
import { slovakServerSideTranslations } from '../../../frontend/utils/slovakServerSideTranslations'

type Params = {
  slug: string
  id: string
}

export const getServerSideProps = amplifyGetServerSideProps<FormPageWrapperProps, Params>(
  async ({ context, getAccessToken, isSignedIn }) => {
    if (!context.params) return { notFound: true }

    const { slug, id } = context.params

    try {
      // These promises cannot be run in parallel because the redirects in catch blocks depends on the error response of the first promise.
      const { data: form } = await formsApi.nasesControllerGetForm(id, {
        accessToken: 'onlyAuthenticated',
        accessTokenSsrGetFn: getAccessToken,
      })
      if (
        !form ||
        /* If there wouldn't be this check it would be possible to open the page with any slug in the URL. */
        form.schemaVersion.schema?.slug !== slug
      ) {
        return { notFound: true }
      }

      const [{ data: files }, initialSignature] = await Promise.all([
        formsApi.filesControllerGetFilesStatusByForm(id, {
          accessToken: 'onlyAuthenticated',
          accessTokenSsrGetFn: getAccessToken,
        }),
        getInitialFormSignature(form.formDataBase64),
      ])

      const formSent = form.state !== GetFormResponseDtoStateEnum.Draft
      // If the form was created by an unauthenticated user, a migration modal is displayed and form is not editable.
      const formMigrationRequired = Boolean(isSignedIn && !form.userExternalId)

      return {
        props: {
          formContext: {
            slug,
            schema: form.schemaVersion.jsonSchema,
            uiSchema: form.schemaVersion.uiSchema,
            formId: id,
            initialFormDataJson: form.formDataJson ?? {},
            initialServerFiles: files,
            initialSignature,
            oldSchemaVersion: !form.isLatestSchemaVersionForSlug,
            formSent,
            formMigrationRequired,
            schemaVersionId: form.schemaVersionId,
            isSigned: form.schemaVersion.isSigned,
            isTaxForm: slug === 'priznanie-k-dani-z-nehnutelnosti',
          },
          ...(await slovakServerSideTranslations()),
        } satisfies FormPageWrapperProps,
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const is401 = error.response?.status === 401
        const is403 = error.response?.status === 403
        const is404 = error.response?.status === 404

        // If logged in user receives 403 for his/her form it's not theirs.
        if (is404 || (is403 && isSignedIn)) {
          return { notFound: true }
        }
        // If logged out user receives 403 for his/her form it might be theirs.
        if (is401 || (is403 && !isSignedIn)) {
          return {
            redirect: {
              destination: `${ROUTES.LOGIN}?${redirectQueryParam}=${encodeURIComponent(
                context.resolvedUrl,
              )}`,
              permanent: false,
            },
          }
        }
      }

      throw error
    }
  },
)

export default SsrAuthProviderHOC(FormPageWrapper)
