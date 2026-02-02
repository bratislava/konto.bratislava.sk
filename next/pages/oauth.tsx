import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import PageLayout from 'components/layouts/PageLayout'
import { useTranslation } from 'next-i18next'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { prefetchUserQuery } from '../frontend/hooks/useUser'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { fetchClientInfo } from '../frontend/utils/fetchClientInfo'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'
import { AmplifyClientOAuthProvider } from '../frontend/utils/useAmplifyClientOAuthContext'
import { AuthPageCommonProps } from './prihlasenie'

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
        <PageLayout variant="login-register" hideBackButton>
          <AccountContainer>
            <AccountSuccessAlert variant="loading" title={t('auth.oauth_page.title')} />
          </AccountContainer>
        </PageLayout>
      </AmplifyClientOAuthProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(OAuthPage)
