import { getFormDefinitionBySlugDev } from 'forms-shared/definitions/getFormDefinitionBySlug'

import FormPageWrapper, { FormPageWrapperProps } from '../../../components/forms/FormPageWrapper'
import { SsrAuthProviderHOC } from '../../../components/logic/SsrAuthContext'
import { environment } from '../../../environment'
import { amplifyGetServerSideProps } from '../../../frontend/utils/amplifyServer'
import { getEmbeddedFormsAllowedOrigins } from '../../../frontend/utils/embeddedFormsAllowedOrigins'
import { slovakServerSideTranslations } from '../../../frontend/utils/slovakServerSideTranslations'

type Params = {
  slug: string
}

/**
 * A route to preview forms in `forms-shared` folder. Backend functionality doesn't work. Works only in development.
 */
export const getServerSideProps = amplifyGetServerSideProps<FormPageWrapperProps, Params>(
  async ({ context }) => {
    if (!environment.featureToggles.developmentForms || !context.params) {
      return { notFound: true }
    }

    const { slug } = context.params
    const formDefinition = getFormDefinitionBySlugDev(slug)
    if (!formDefinition) {
      return { notFound: true }
    }

    const isEmbeddedQueryParam = context.query['externa-sluzba'] === 'true'

    if (isEmbeddedQueryParam) {
      const allowedOrigins = getEmbeddedFormsAllowedOrigins(formDefinition)
      if (!allowedOrigins) {
        return { notFound: true }
      }

      context.res.setHeader(
        'Content-Security-Policy',
        `frame-ancestors ${allowedOrigins.join(' ')}`,
      )
    }

    return {
      props: {
        formContext: {
          formDefinition,
          formId: '',
          initialFormDataJson: {},
          initialServerFiles: [],
          formSent: false,
          formMigrationRequired: false,
          isEmbedded: isEmbeddedQueryParam,
          isDevRoute: true,
        },
        ...(await slovakServerSideTranslations()),
      } satisfies FormPageWrapperProps,
    }
  },
)

export default SsrAuthProviderHOC(FormPageWrapper)
