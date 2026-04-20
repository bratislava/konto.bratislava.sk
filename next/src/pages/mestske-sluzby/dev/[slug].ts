import { getFormDefinitionBySlugDev } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'

import { makeClientFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import FormPage, { FormPageProps } from '@/src/components/forms/FormPage'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { environment } from '@/src/environment'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { handleEmbeddedFormRequest } from '@/src/frontend/utils/embeddedFormsHelpers'
import { getDefaultFormDataForFormDefinition } from '@/src/frontend/utils/getDefaultFormDataForFormDefinition'
import { getInitialSummaryJson } from '@/src/frontend/utils/getInitialSummaryJson'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'
import type { GlobalAppProps } from '@/src/pages/_app'

type Params = {
  slug: string
}

/**
 * A route to preview forms in `forms-shared` folder. Backend functionality doesn't work. Works only in development.
 */
export const getServerSideProps = amplifyGetServerSideProps<FormPageProps & GlobalAppProps, Params>(
  async ({ context }) => {
    if (!environment.featureToggles.developmentForms || !context.params) {
      return { notFound: true }
    }

    const { slug } = context.params
    const serverFormDefinition = getFormDefinitionBySlugDev(slug)
    if (!serverFormDefinition) {
      return { notFound: true }
    }

    const { success: embeddedSuccess, isEmbedded } = handleEmbeddedFormRequest(
      serverFormDefinition,
      context,
    )
    if (!embeddedSuccess) {
      return { notFound: true }
    }

    const initialFormDataJson = getDefaultFormDataForFormDefinition(serverFormDefinition)

    return {
      props: {
        formServerContext: {
          formDefinition: makeClientFormDefinition(serverFormDefinition),
          formId: '',
          initialFormDataJson,
          initialServerFiles: [],
          initialFormSent: false,
          initialSummaryJson: getInitialSummaryJson(
            context.query,
            serverFormDefinition,
            initialFormDataJson,
          ),
          formMigrationRequired: false,
          isEmbedded,
          isDevRoute: true,
          strapiForm: { slug },
          versionCompareContinueAction: VersionCompareContinueAction.None,
        },
        appProps: {
          externallyEmbedded: isEmbedded,
        },
        ...(await slovakServerSideTranslations()),
      },
    }
  },
)

export default SsrAuthProviderHOC(FormPage)
