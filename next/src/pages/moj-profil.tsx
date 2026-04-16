import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next/pages'

import { strapiClient } from '@/src/clients/graphql-strapi'
import { GeneralQuery } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import UserProfilePageContent from '@/src/components/page-contents/UserProfilePageContent/UserProfilePageContent'
import PageHeader from '@/src/components/segments/PageHeader/PageHeader'
import { prefetchUserQuery } from '@/src/frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type MojProfilProps = {
  general: GeneralQuery
  dehydratedState: DehydratedState
}

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ fetchAuthSession }) => {
    const general = await strapiClient.General()

    const queryClient = new QueryClient()
    await prefetchUserQuery(queryClient, fetchAuthSession)

    return {
      props: {
        general,
        dehydratedState: dehydrate(queryClient),
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const MojProfil = ({ general, dehydratedState }: MojProfilProps) => {
  const { t } = useTranslation('account')

  return (
    <HydrationBoundary state={dehydratedState}>
      <GeneralContextProvider general={general}>
        <PageLayout>
          <PageHeader title={t('account_section_my_profile.title')} />
          <UserProfilePageContent />
        </PageLayout>
      </GeneralContextProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(MojProfil)
