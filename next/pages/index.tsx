import IntroSection from 'components/forms/segments/AccountSections/IntroSection/IntroSection'
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

const AccountIntroPage = () => {
  return (
    <AccountPageLayout>
      <IntroSection />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountIntroPage)
