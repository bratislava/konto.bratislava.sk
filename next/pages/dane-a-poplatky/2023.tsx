import AccountPageLayout from 'components/layouts/AccountPageLayout'

import TaxFeeSection from '../../components/forms/segments/AccountSections/TaxesFeesSection/TaxFeeSection'
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
      <TaxFeeSection />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountTaxesFeesPage)
