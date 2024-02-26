import TaxesFeesSection from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(
  async () => {
    return {
      props: {
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const AccountTaxesFeesPage = () => {
  return (
    <AccountPageLayout>
      <TaxesFeesSection />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
