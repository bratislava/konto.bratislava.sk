import { formsClient } from '@clients/forms'
import { strapiClient } from '@clients/graphql-strapi'
import { FormWithLandingPageFragment } from '@clients/graphql-strapi/api'
import { isAxiosError } from 'axios'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import FormLandingPage, {
  FormLandingPageProps,
  FormWithLandingPageRequiredFragment,
} from '../../../components/forms/FormLandingPage'
import { SsrAuthProviderHOC } from '../../../components/logic/SsrAuthContext'
import { ROUTES } from '../../../frontend/api/constants'
import { amplifyGetServerSideProps } from '../../../frontend/utils/amplifyServer'
import {
  EMBEDDED_FORM_QUERY_PARAM,
  EMBEDDED_FORM_QUERY_PARAM_TRUE_VALUE,
  handleEmbeddedFormRequest,
} from '../../../frontend/utils/embeddedFormsHelpers'
import { slovakServerSideTranslations } from '../../../frontend/utils/slovakServerSideTranslations'

type Params = {
  slug: string
}

const fetchStrapiForm = async (
  slug: string,
): Promise<FormWithLandingPageFragment | null | undefined> => {
  const result = await strapiClient.FormWithLandingPageBySlug({ slug })

  return result.forms?.data?.[0]?.attributes
}

export const formHasLandingPage = (
  form: FormWithLandingPageFragment | null | undefined,
): form is FormWithLandingPageRequiredFragment => {
  return Boolean(form?.landingPage)
}

export const getServerSideProps = amplifyGetServerSideProps<FormLandingPageProps, Params>(
  async ({ context, getAccessToken }) => {
    if (!context.params) {
      return { notFound: true }
    }

    const { slug } = context.params
    const formDefinition = getFormDefinitionBySlug(slug)
    if (!formDefinition) {
      return { notFound: true }
    }

    const strapiForm = await fetchStrapiForm(slug)
    if (formHasLandingPage(strapiForm)) {
      return {
        props: {
          formDefinition,
          strapiForm,
          ...(await slovakServerSideTranslations()),
        },
      }
    }

    // If Strapi form does not have a landing page, create a new form instance and redirect to it directly.
    try {
      const { data: form } = await formsClient.nasesControllerCreateForm(
        {
          formDefinitionSlug: slug,
        },
        { accessToken: 'onlyAuthenticated', accessTokenSsrGetFn: getAccessToken },
      )

      if (!form) {
        return { notFound: true }
      }

      const { success: embeddedSuccess, isEmbedded } = handleEmbeddedFormRequest(
        formDefinition,
        context,
      )
      if (!embeddedSuccess) {
        return { notFound: true }
      }

      // The query param needs to be carried on to the new form instance page.
      const isEmbeddedPostfix = isEmbedded
        ? `?${EMBEDDED_FORM_QUERY_PARAM}=${EMBEDDED_FORM_QUERY_PARAM_TRUE_VALUE}`
        : ''
      return {
        redirect: {
          destination: `${ROUTES.MUNICIPAL_SERVICES}/${slug}/${form.id}${isEmbeddedPostfix}`,
          permanent: false,
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

export default SsrAuthProviderHOC(FormLandingPage)
