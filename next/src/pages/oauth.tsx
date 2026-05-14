import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next/pages'

import { strapiClient } from '@/src/clients/graphql-strapi'
import AccountContainer from '@/src/components/layouts/AccountContainer'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import AccountSuccessAlert from '@/src/components/segments/AccountSuccessAlert/AccountSuccessAlert'
import { AmplifyClientOAuthProvider } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import { prefetchUserQuery } from '@/src/frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { fetchClientInfo } from '@/src/frontend/utils/fetchClientInfo'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'
import { AuthPageCommonProps } from '@/src/pages/prihlasenie'

type PageProps = AuthPageCommonProps & {
  dehydratedState: DehydratedState
}

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context, fetchAuthSession }) => {
    const queryClient = new QueryClient()
    await prefetchUserQuery(queryClient, fetchAuthSession)

    const [general, clientInfo] = await Promise.all([
      strapiClient.General(),
      fetchClientInfo(context.query),
    ])

    return {
      props: {
        general,
        clientInfo,
        dehydratedState: dehydrate(queryClient),
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { isOAuthRedirect: true, redirectOAuthParams: true },
)

const OAuthPage = ({ general, clientInfo, dehydratedState }: PageProps) => {
  const { t } = useTranslation('account')

  // This page should never render, instead, redirect to LOGIN or OAUTH_CONFIRM page should happen on server
  return (
    <HydrationBoundary state={dehydratedState}>
      <AmplifyClientOAuthProvider clientInfo={clientInfo}>
        <GeneralContextProvider general={general}>
          <PageLayout variant="auth" hideBackButton>
            <AccountContainer>
              <AccountSuccessAlert variant="loading" title={t('auth.oauth_page.title')} />
            </AccountContainer>
          </PageLayout>
        </GeneralContextProvider>
      </AmplifyClientOAuthProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(OAuthPage)
