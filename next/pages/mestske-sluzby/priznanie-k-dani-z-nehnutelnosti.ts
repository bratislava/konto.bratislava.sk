import TaxFormLandingPage from '../../components/forms/TaxFormLandingPage'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

/**
 * Temporary landing page only for tax form, which overrides the [slug] route, until we create unified landing page for
 * all forms.
 */
export const getServerSideProps = amplifyGetServerSideProps(async () => {
  return {
    props: {
      ...(await slovakServerSideTranslations()),
    },
  }
})

export default SsrAuthProviderHOC(TaxFormLandingPage)
