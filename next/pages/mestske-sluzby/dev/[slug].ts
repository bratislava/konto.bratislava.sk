import { getFormDefinitionBySlugDev } from 'forms-shared/definitions/getFormDefinitionBySlug'

import FormPageWrapper, { FormPageWrapperProps } from '../../../components/forms/FormPageWrapper'
import { makeSerializableFormDefinition } from '../../../components/forms/serializableFormDefinition'
import { SsrAuthProviderHOC } from '../../../components/logic/SsrAuthContext'
import { environment } from '../../../environment'
import { amplifyGetServerSideProps } from '../../../frontend/utils/amplifyServer'
import { handleEmbeddedFormRequest } from '../../../frontend/utils/embeddedFormsHelpers'
import { getDefaultFormDataForFormDefinition } from '../../../frontend/utils/getDefaultFormDataForFormDefinition'
import { slovakServerSideTranslations } from '../../../frontend/utils/slovakServerSideTranslations'
import type { GlobalAppProps } from '../../_app'

type Params = {
  slug: string
}

/**
 * A route to preview forms in `forms-shared` folder. Backend functionality doesn't work. Works only in development.
 */
export const getServerSideProps = amplifyGetServerSideProps<
  FormPageWrapperProps & GlobalAppProps,
  Params
>(async ({ context }) => {
  if (!environment.featureToggles.developmentForms || !context.params) {
    return { notFound: true }
  }

  const { slug } = context.params
  const formDefinition = getFormDefinitionBySlugDev(slug)
  if (!formDefinition) {
    return { notFound: true }
  }

  const { success: embeddedSuccess, isEmbedded } = handleEmbeddedFormRequest(
    formDefinition,
    context,
  )
  if (!embeddedSuccess) {
    return { notFound: true }
  }

  return {
    props: {
      formServerContext: {
        formDefinition: makeSerializableFormDefinition(formDefinition),
        formId: '',
        initialFormDataJson: getDefaultFormDataForFormDefinition(formDefinition),
        initialServerFiles: [],
        formSent: false,
        formMigrationRequired: false,
        isEmbedded,
        isDevRoute: true,
        strapiForm: { slug },
      },
      appProps: {
        externallyEmbedded: isEmbedded,
      },
      ...(await slovakServerSideTranslations()),
    },
  }
})

export default SsrAuthProviderHOC(FormPageWrapper)
