import UserProfileView from 'components/forms/segments/UserProfile/UserProfileView'
import { useTranslation } from 'next-i18next'

import AccountSectionHeader from '../components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import AccountPageLayout from '../components/layouts/AccountPageLayout'
import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

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

const MojProfil = () => {
  const { t } = useTranslation('account')

  return (
    <AccountPageLayout>
      <AccountSectionHeader title={t('my_profile')} />
      <UserProfileView />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(MojProfil)
