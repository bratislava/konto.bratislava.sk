import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'

import PageLayout from '@/src/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import AccountSectionHeader from '@/src/components/segments/AccountSectionHeader/AccountSectionHeader'
import UserProfileView from '@/src/components/segments/UserProfile/UserProfileView'
import { prefetchUserQuery } from '@/src/frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

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
      <PageLayout>
        <AccountSectionHeader title={t('account_section_my_profile.title')} />
        <UserProfileView />
      </PageLayout>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(MojProfil)
