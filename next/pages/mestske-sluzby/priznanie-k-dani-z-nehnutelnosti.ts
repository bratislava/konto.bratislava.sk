import { formsApi } from '@clients/forms'
import { isAxiosError } from 'axios'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import TaxFormLandingPage, {
  TaxFormLandingPageProps,
} from '../../components/forms/TaxFormLandingPage'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from '../../components/logic/ServerSideAuthProvider'

/**
 * Temporary landing page only for tax form, which overrides the [slug] route, until we create unified landing page for
 * all forms.
 */
export const getServerSideProps: GetServerSideProps<TaxFormLandingPageProps> = async (ctx) => {
  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)
  const locale = 'sk'

  try {
    const schema = await formsApi.schemasControllerGetSchema('priznanie-k-dani-z-nehnutelnosti', {
      accessToken: 'onlyAuthenticated',
      accessTokenSsrReq: ctx.req,
    })

    const { latestVersionId, latestVersion } = schema.data
    if (!latestVersionId || !latestVersion) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        ssrCurrentAuthProps,
        latestVersionId,
        ...(await serverSideTranslations(locale)),
      } satisfies TaxFormLandingPageProps,
    }
  } catch (error) {
    if (isAxiosError(error)) {
      const is404 = error.response?.status === 404
      if (is404) {
        return { notFound: true }
      }
    }

    throw error
  }
}

export default ServerSideAuthProviderHOC(TaxFormLandingPage)
