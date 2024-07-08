import { formsApi } from '@clients/forms'
import { isAxiosError } from 'axios'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import { ROUTES } from '../../../frontend/api/constants'
import { amplifyGetServerSideProps } from '../../../frontend/utils/amplifyServer'

type Params = {
  slug: string
}

export const getServerSideProps = amplifyGetServerSideProps<{}, Params>(
  async ({ context, getAccessToken }) => {
    if (!context.params) {
      return { notFound: true }
    }

    const { slug } = context.params
    const formDefinition = getFormDefinitionBySlug(slug)
    if (!formDefinition) {
      return { notFound: true }
    }

    try {
      const { data: form } = await formsApi.nasesControllerCreateForm(
        {
          formDefinitionSlug: slug,
        },
        { accessToken: 'onlyAuthenticated', accessTokenSsrGetFn: getAccessToken },
      )

      if (!form) {
        return { notFound: true }
      }

      return {
        redirect: {
          destination: `${ROUTES.MUNICIPAL_SERVICES}/${slug}/${form.id}`,
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
  { skipSsrAuthContext: true },
)

const EmptyComponent = () => {}
export default EmptyComponent
