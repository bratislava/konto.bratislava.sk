import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import UserProfileView from 'components/forms/segments/UserProfile/UserProfileView'
import { useTranslation } from 'next-i18next'

import AccountSectionHeader from '../components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import AccountPageLayout from '../components/layouts/AccountPageLayout'
import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { prefetchUserQuery } from '../frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

type MojProfilProps = {
  dehydratedState: DehydratedState
}

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ fetchAuthSession }) => {
    const queryClient = new QueryClient()
    await prefetchUserQuery(queryClient, fetchAuthSession)

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const MojProfil = ({ dehydratedState }: MojProfilProps) => {
  const { t } = useTranslation('account')

  return (
    <HydrationBoundary state={dehydratedState}>
      <AccountPageLayout>
        <AccountSectionHeader title={t('my_profile')} />
        <UserProfileView />
      </AccountPageLayout>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(MojProfil)
