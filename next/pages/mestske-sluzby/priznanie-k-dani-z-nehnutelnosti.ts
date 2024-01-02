import { formsApi } from '@clients/forms'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import TaxFormLandingPage, {
  TaxFormLandingPageProps,
} from '../../components/forms/TaxFormLandingPage'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from '../../components/logic/ServerSideAuthProvider'
import { environment } from '../../environment'

/**
 * Temporary landing page only for tax form, which overrides the [slug] route, until we create unified landing page for
 * all forms.
 */
export const getServerSideProps: GetServerSideProps<TaxFormLandingPageProps> = async (ctx) => {
  if (!environment.featureToggles.priznanieKDaniZNehnutelnostiLandingPage) return { notFound: true }

  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)
  const locale = 'sk'

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
      page: {
        locale,
      },
      latestVersionId,
      ...(await serverSideTranslations(locale)),
    } satisfies TaxFormLandingPageProps,
  }
}

export default ServerSideAuthProviderHOC(TaxFormLandingPage)
