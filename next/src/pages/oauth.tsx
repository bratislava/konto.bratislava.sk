import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'

import PageLayout from '@/src/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import AccountContainer from '@/src/components/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from '@/src/components/segments/AccountSuccessAlert/AccountSuccessAlert'
import { prefetchUserQuery } from '@/src/frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { fetchClientInfo } from '@/src/frontend/utils/fetchClientInfo'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'
import { AmplifyClientOAuthProvider } from '@/src/frontend/utils/useAmplifyClientOAuthContext'
import { AuthPageCommonProps } from '@/src/pages/prihlasenie'

type PageProps = AuthPageCommonProps & {
  dehydratedState: DehydratedState
}

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context, fetchAuthSession }) => {
    const queryClient = new QueryClient()
    await prefetchUserQuery(queryClient, fetchAuthSession)

    const clientInfo = await fetchClientInfo(context.query)

    return {
      props: {
        clientInfo,
        dehydratedState: dehydrate(queryClient),
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { isOAuthRedirect: true, redirectOAuthParams: true },
)

const OAuthPage = ({ clientInfo, dehydratedState }: PageProps) => {
  const { t } = useTranslation('account')

  // This page should never render, instead, redirect to LOGIN or OAUTH_CONFIRM page should happen on server
  return (
    <HydrationBoundary state={dehydratedState}>
      <AmplifyClientOAuthProvider clientInfo={clientInfo}>
        <PageLayout variant="auth" hideBackButton>
          <AccountContainer>
            <AccountSuccessAlert variant="loading" title={t('auth.oauth_page.title')} />
          </AccountContainer>
        </PageLayout>
      </AmplifyClientOAuthProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(OAuthPage)
