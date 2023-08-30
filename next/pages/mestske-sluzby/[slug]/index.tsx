import { formsApi } from '@clients/forms'
import { isAxiosError } from 'axios'
import { GetServerSideProps } from 'next'

import { FormPageWrapperProps } from '../../../components/forms/FormPageWrapper'
import { environment } from '../../../environment'
import { ROUTES } from '../../../frontend/api/constants'

type Params = {
  slug: string
}

export const getServerSideProps: GetServerSideProps<FormPageWrapperProps, Params> = async (ctx) => {
  if (!environment.featureToggles.forms || !ctx.params) return { notFound: true }

  const { slug } = ctx.params

  try {
    const schema = await formsApi.schemasControllerGetSchema(slug, {
      accessToken: 'onlyAuthenticated',
      accessTokenSsrReq: ctx.req,
    })
    const { latestVersionId, latestVersion } = schema.data
    if (!latestVersionId || !latestVersion) {
      return {
        notFound: true,
      }
    }

    const { data: form } = await formsApi
      .nasesControllerCreateForm(
        {
          schemaVersionId: latestVersionId,
        },
        { accessToken: 'onlyAuthenticated', accessTokenSsrReq: ctx.req },
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
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        return { notFound: true }
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        return {
          // TODO: Redirect back after login
          redirect: {
            destination: ROUTES.LOGIN,
            permanent: false,
          },
        }
      }
    }

    throw error
  }
}

const EmptyComponent = () => {}
export default EmptyComponent
