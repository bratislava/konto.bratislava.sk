import { isAxiosError } from 'axios'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import {
  VersionCompareContinueAction,
  versionCompareContinueAction,
} from 'forms-shared/versioning/version-compare'
import { GetFormResponseDtoStateEnum } from 'openapi-clients/forms'

import { formsClient } from '@/clients/forms'
import { strapiClient } from '@/clients/graphql-strapi'
import { FormBaseFragment } from '@/clients/graphql-strapi/api'
import { makeClientFormDefinition } from '@/components/forms/clientFormDefinitions'
import FormPage, { FormPageProps } from '@/components/forms/FormPage'
import { SsrAuthProviderHOC } from '@/components/logic/SsrAuthContext'
import { environment } from '@/environment'
import { ROUTES } from '@/frontend/api/constants'
import { amplifyGetServerSideProps } from '@/frontend/utils/amplifyServer'
import { handleEmbeddedFormRequest } from '@/frontend/utils/embeddedFormsHelpers'
import { getDefaultFormDataForFormDefinition } from '@/frontend/utils/getDefaultFormDataForFormDefinition'
import { getInitialSummaryJson } from '@/frontend/utils/getInitialSummaryJson'
import { redirectQueryParam } from '@/frontend/utils/queryParamRedirect'
import { slovakServerSideTranslations } from '@/frontend/utils/slovakServerSideTranslations'
import type { GlobalAppProps } from '@/pages/_app'

const fetchStrapiForm = async (slug: string): Promise<FormBaseFragment | null | undefined> => {
  const result = await strapiClient.FormBaseBySlug({ slug })

  return result.forms?.data?.[0]?.attributes
}

type Params = {
  slug: string
  id: string
}

export const getServerSideProps = amplifyGetServerSideProps<FormPageProps & GlobalAppProps, Params>(
  async ({ context, fetchAuthSession, isSignedIn }) => {
    const nonce = context.req.headers['x-nonce'] as string | undefined // TODO type

    if (!context.params) {
      return { notFound: true }
    }

    const { slug, id: formId } = context.params
    const serverFormDefinition = getFormDefinitionBySlug(slug)
    if (!serverFormDefinition) {
      return { notFound: true }
    }

    try {
      // These promises cannot be run in parallel because the redirects in catch blocks depends on the error response of the first promise.
      const { data: form } = await formsClient.nasesControllerGetForm(formId, {
        authStrategy: 'authOrGuestWithToken',
        getSsrAuthSession: fetchAuthSession,
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
          authStrategy: 'authOrGuestWithToken',
          getSsrAuthSession: fetchAuthSession,
        }),
        fetchStrapiForm(slug),
      ])

      const initialFormSent = form.state !== GetFormResponseDtoStateEnum.Draft
      const { success: embeddedSuccess, isEmbedded } = handleEmbeddedFormRequest(
        serverFormDefinition,
        context,
      )
      if (!embeddedSuccess) {
        return { notFound: true }
      }
      const initialFormDataJson =
        form.formDataJson ?? getDefaultFormDataForFormDefinition(serverFormDefinition)

      return {
        props: {
          nonce,
          formServerContext: {
            formDefinition: makeClientFormDefinition(serverFormDefinition),
            formId,
            initialFormDataJson,
            initialServerFiles: files,
            initialSignature: form.formSignature ?? null,
            initialFormSent,
            initialSummaryJson: getInitialSummaryJson(
              context.query,
              serverFormDefinition,
              initialFormDataJson,
            ),
            formMigrationRequired: form.requiresMigration,
            isEmbedded,
            strapiForm: strapiForm ?? null,
            versionCompareContinueAction: environment.featureToggles.versioning
              ? versionCompareContinueAction({
                  currentVersion: form.jsonVersion,
                  latestVersion: serverFormDefinition.jsonVersion,
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
