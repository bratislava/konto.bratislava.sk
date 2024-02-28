import HelpSection from 'components/forms/segments/AccountSections/HelpSection/HelpSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(async () => {
  return {
    props: {
      ...(await slovakServerSideTranslations()),
    },
  }
})

const AccountHelpPage = () => {
  return (
    <AccountPageLayout>
      <HelpSection />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountHelpPage)
