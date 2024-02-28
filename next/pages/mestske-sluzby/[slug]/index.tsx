import { formsApi } from '@clients/forms'
import { isAxiosError } from 'axios'

import { ROUTES } from '../../../frontend/api/constants'
import { amplifyGetServerSideProps } from '../../../frontend/utils/amplifyServer'

type Params = {
  slug: string
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const getServerSideProps = amplifyGetServerSideProps<{}, Params>(
  async ({ context, getAccessToken }) => {
    if (!context.params) return { notFound: true }

    const { slug } = context.params

    try {
      const schema = await formsApi.schemasControllerGetSchema(slug, {
        accessToken: 'onlyAuthenticated',
        accessTokenSsrGetFn: getAccessToken,
      })
      const { latestVersionId, latestVersion } = schema.data
      if (!latestVersionId || !latestVersion) {
        return {
          notFound: true,
        }
      }

      const { data: form } = await formsApi.nasesControllerCreateForm(
        {
          schemaVersionId: latestVersionId,
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
