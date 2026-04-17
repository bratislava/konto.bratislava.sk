import { isAxiosError } from 'axios'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import { formsClient } from '@/src/clients/forms'
import { strapiClient } from '@/src/clients/graphql-strapi'
import { FormWithLandingPageFragment, GeneralQuery } from '@/src/clients/graphql-strapi/api'
import { makeClientLandingPageFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import FormCreatedSplitPage, {
  FormCreatedSplitPageProps,
} from '@/src/components/forms/FormCreatedSplitPage'
import { FormWithLandingPageRequiredFragment } from '@/src/components/forms/FormLandingPage'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import {
  EMBEDDED_FORM_QUERY_PARAM,
  EMBEDDED_FORM_QUERY_PARAM_TRUE_VALUE,
  handleEmbeddedFormRequest,
} from '@/src/frontend/utils/embeddedFormsHelpers'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'
import { ROUTES } from '@/src/utils/routes'

type Params = {
  slug: string
}

const fetchStrapiForm = async (
  slug: string,
): Promise<FormWithLandingPageFragment | null | undefined> => {
  const result = await strapiClient.FormWithLandingPageBySlug({ slug })

  return result.forms[0]
}

export const formHasLandingPage = (
  form: FormWithLandingPageFragment | null | undefined,
): form is FormWithLandingPageRequiredFragment => {
  return Boolean(form?.landingPage)
}

type Props = FormCreatedSplitPageProps & {
  general: GeneralQuery
}

export const getServerSideProps = amplifyGetServerSideProps<Props, Params>(
  async ({ context, fetchAuthSession }) => {
    if (!context.params) {
      return { notFound: true }
    }

    const { slug } = context.params
    const serverFormDefinition = getFormDefinitionBySlug(slug)
    if (!serverFormDefinition) {
      return { notFound: true }
    }

    const [general, strapiForm] = await Promise.all([strapiClient.General(), fetchStrapiForm(slug)])
    if (formHasLandingPage(strapiForm)) {
      return {
        props: {
          general,
          type: 'landingPage',
          formDefinition: makeClientLandingPageFormDefinition(serverFormDefinition),
          strapiForm,
          ...(await slovakServerSideTranslations()),
        },
      }
    }

    // If Strapi form does not have a landing page, create a new form instance and redirect to it directly.
    try {
      const { data: form } = await formsClient.formsV2ControllerCreateForm(
        {
          formDefinitionSlug: slug,
        },
        { authStrategy: 'authOrGuestWithToken', getSsrAuthSession: fetchAuthSession },
      )

      if (!form) {
        return { notFound: true }
      }

      const { success: embeddedSuccess, isEmbedded } = handleEmbeddedFormRequest(
        serverFormDefinition,
        context,
      )
      if (!embeddedSuccess) {
        return { notFound: true }
      }

      // The query param needs to be carried on to the new form instance page.
      const isEmbeddedPostfix = isEmbedded
        ? `?${EMBEDDED_FORM_QUERY_PARAM}=${EMBEDDED_FORM_QUERY_PARAM_TRUE_VALUE}`
        : ''

      // If user receives a new guest identity, the user must be redirected to the form client-side because redirect
      // requests are not able to save new guest identity cookie.
      return {
        props: {
          general,
          type: 'redirect',
          redirectUrl: `${ROUTES.MUNICIPAL_SERVICES_FORM_WITH_ID(slug, form.formId)}${isEmbeddedPostfix}`,
          ...(await slovakServerSideTranslations()),
        },
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return { notFound: true }
      }

      throw error
    }
  },
  {},
)

const MunicipalServicesFormSplitPage = ({ general, ...props }: Props) => (
  <GeneralContextProvider general={general}>
    <FormCreatedSplitPage {...props} />
  </GeneralContextProvider>
)

export default SsrAuthProviderHOC(MunicipalServicesFormSplitPage)
