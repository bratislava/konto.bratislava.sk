import { getFormDefinitionBySlugDev } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'

import { makeClientFormDefinition } from '@/components/forms/clientFormDefinitions'
import FormPageWrapper, { FormPageProps } from '@/components/forms/FormPage'
import { SsrAuthProviderHOC } from '@/components/logic/SsrAuthContext'
import { environment } from '@/environment'
import { amplifyGetServerSideProps } from '@/frontend/utils/amplifyServer'
import { handleEmbeddedFormRequest } from '@/frontend/utils/embeddedFormsHelpers'
import { getDefaultFormDataForFormDefinition } from '@/frontend/utils/getDefaultFormDataForFormDefinition'
import { getInitialSummaryJson } from '@/frontend/utils/getInitialSummaryJson'
import { slovakServerSideTranslations } from '@/frontend/utils/slovakServerSideTranslations'
import type { GlobalAppProps } from '@/pages/_app'

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

export default SsrAuthProviderHOC(FormPageWrapper)
