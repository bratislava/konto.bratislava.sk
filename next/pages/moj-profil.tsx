import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'

import AccountSectionHeader from '@/components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import UserProfileView from '@/components/forms/segments/UserProfile/UserProfileView'
import PageLayout from '@/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/components/logic/SsrAuthContext'
import { prefetchUserQuery } from '@/frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '@/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/frontend/utils/slovakServerSideTranslations'

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
