import UserProfileView from 'components/forms/segments/UserProfile/UserProfileView'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import AccountSectionHeader from '../components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import AccountPageLayout from '../components/layouts/AccountPageLayout'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'
  return {
    props: {
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const MojProfil = () => {
  const { t } = useTranslation('account')

  return (
    <AccountPageLayout>
      <AccountSectionHeader title={t('my_profile')} />
      <UserProfileView />
    </AccountPageLayout>
  )
}

export default ServerSideAuthProviderHOC(MojProfil)
