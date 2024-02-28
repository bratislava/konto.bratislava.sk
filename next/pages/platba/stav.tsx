import ThankYouSection from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(async () => {
  return {
    props: {
      ...(await slovakServerSideTranslations()),
    },
  }
})

const AccountThankYouPage = () => {
  return (
    <AccountPageLayout hiddenHeaderNav className="bg-gray-50">
      <ThankYouSection />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountThankYouPage)
