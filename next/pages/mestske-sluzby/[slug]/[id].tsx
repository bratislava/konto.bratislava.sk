import { formsClient } from '@clients/forms'
import { strapiClient } from '@clients/graphql-strapi'
import { FormBaseFragment } from '@clients/graphql-strapi/api'
import { GetFormResponseDtoStateEnum } from '@clients/openapi-forms'
import { isAxiosError } from 'axios'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import {
  VersionCompareContinueAction,
  versionCompareContinueAction,
} from 'forms-shared/versioning/version-compare'

import FormPage, { FormPageProps } from '../../../components/forms/FormPage'
import { makeSerializableFormDefinition } from '../../../components/forms/serializableFormDefinition'
import { SsrAuthProviderHOC } from '../../../components/logic/SsrAuthContext'
import { environment } from '../../../environment'
import { ROUTES } from '../../../frontend/api/constants'
import { amplifyGetServerSideProps } from '../../../frontend/utils/amplifyServer'
import { handleEmbeddedFormRequest } from '../../../frontend/utils/embeddedFormsHelpers'
import { getDefaultFormDataForFormDefinition } from '../../../frontend/utils/getDefaultFormDataForFormDefinition'
import { getInitialSummaryJson } from '../../../frontend/utils/getInitialSummaryJson'
import { redirectQueryParam } from '../../../frontend/utils/queryParamRedirect'
import { slovakServerSideTranslations } from '../../../frontend/utils/slovakServerSideTranslations'
import type { GlobalAppProps } from '../../_app'

const fetchStrapiForm = async (slug: string): Promise<FormBaseFragment | null | undefined> => {
  const result = await strapiClient.FormBaseBySlug({ slug })

  return result.forms?.data?.[0]?.attributes
}

type Params = {
  slug: string
  id: string
}

export const getServerSideProps = amplifyGetServerSideProps<FormPageProps & GlobalAppProps, Params>(
  async ({ context, getAccessToken, isSignedIn }) => {
    if (!context.params) {
      return { notFound: true }
    }

    const { slug, id: formId } = context.params
    const formDefinition = getFormDefinitionBySlug(slug)
    if (!formDefinition) {
      return { notFound: true }
    }

    try {
      // These promises cannot be run in parallel because the redirects in catch blocks depends on the error response of the first promise.
      const { data: form } = await formsClient.nasesControllerGetForm(formId, {
        accessToken: 'onlyAuthenticated',
        accessTokenSsrGetFn: getAccessToken,
      })
      if (
        !form ||
        /* If there wouldn't be this check it would be possible to open the page with any slug in the URL. */
        form.formDefinitionSlug !== slug
      ) {
        return { notFound: true }
      }

      const [{ data: files }, strapiForm] = await Promise.all([
        formsClient.filesControllerGetFilesStatusByForm(formId, {
          accessToken: 'onlyAuthenticated',
          accessTokenSsrGetFn: getAccessToken,
        }),
        fetchStrapiForm(slug),
      ])

      const initialFormSent = form.state !== GetFormResponseDtoStateEnum.Draft
      // If the form was created by an unauthenticated user, a migration modal is displayed and form is not editable.
      const formMigrationRequired = Boolean(isSignedIn && !form.userExternalId)

      const { success: embeddedSuccess, isEmbedded } = handleEmbeddedFormRequest(
        formDefinition,
        context,
      )
      if (!embeddedSuccess) {
        return { notFound: true }
      }
      const initialFormDataJson =
        form.formDataJson ?? getDefaultFormDataForFormDefinition(formDefinition)

      return {
        props: {
          formServerContext: {
            formDefinition: makeSerializableFormDefinition(formDefinition),
            formId,
            initialFormDataJson,
            initialServerFiles: files,
            initialSignature: form.formSignature ?? null,
            initialFormSent,
            initialSummaryJson: getInitialSummaryJson(
              context.query,
              formDefinition,
              initialFormDataJson,
            ),
            formMigrationRequired,
            isEmbedded,
            strapiForm: strapiForm ?? null,
            versionCompareContinueAction: environment.featureToggles.versioning
              ? versionCompareContinueAction({
                  currentVersion: form.jsonVersion,
                  latestVersion: formDefinition.jsonVersion,
                })
              : VersionCompareContinueAction.None,
          },
          appProps: {
            externallyEmbedded: isEmbedded,
          },
          ...(await slovakServerSideTranslations()),
        },
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

export default SsrAuthProviderHOC(FormPage)
