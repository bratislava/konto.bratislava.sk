import { taxApi } from '@clients/tax'
import IntroSection from 'components/forms/segments/AccountSections/IntroSection/IntroSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

type AccountIntroPageProps = {}

/* Temporary promo banner for 2024 tax. */
const getDisplayTaxToPayBanner = async (
  isSignedIn: boolean,
  getAccessToken: () => Promise<string | null>,
) => {
  if (!isSignedIn) {
    return false
  }

  try {
    const response = await taxApi.taxControllerGetActualTaxes(2024, {
      accessToken: 'always',
      accessTokenSsrGetFn: getAccessToken,
    })

    return response.status === 200
  } catch (error) {
    return false
  }
}

export const getServerSideProps = amplifyGetServerSideProps<AccountIntroPageProps>(
  async ({ isSignedIn, getAccessToken }) => {
    return {
      props: {
        displayTaxToPayBanner: await getDisplayTaxToPayBanner(isSignedIn, getAccessToken),
        ...(await slovakServerSideTranslations()),
      },
    }
  },
)

// eslint-disable-next-line no-empty-pattern
const AccountIntroPage = ({}: AccountIntroPageProps) => {
  return (
    <AccountPageLayout>
      <IntroSection />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountIntroPage)
