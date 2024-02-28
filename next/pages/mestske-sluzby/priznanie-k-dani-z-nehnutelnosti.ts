import { formsApi } from '@clients/forms'
import { isAxiosError } from 'axios'

import TaxFormLandingPage, {
  TaxFormLandingPageProps,
} from '../../components/forms/TaxFormLandingPage'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

/**
 * Temporary landing page only for tax form, which overrides the [slug] route, until we create unified landing page for
 * all forms.
 */
export const getServerSideProps = amplifyGetServerSideProps(async ({ getAccessToken }) => {
  try {
    const schema = await formsApi.schemasControllerGetSchema('priznanie-k-dani-z-nehnutelnosti', {
      accessToken: 'onlyAuthenticated',
      accessTokenSsrGetFn: getAccessToken,
    })

    const { latestVersionId, latestVersion } = schema.data
    if (!latestVersionId || !latestVersion) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        latestVersionId,
        ...(await slovakServerSideTranslations()),
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
})

export default SsrAuthProviderHOC(TaxFormLandingPage)
