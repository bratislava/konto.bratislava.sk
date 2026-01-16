import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { useSsrAuth } from '../frontend/hooks/useSsrAuth'
import { prefetchUserQuery } from '../frontend/hooks/useUser'
import { useSignOut } from '../frontend/utils/amplifyClient'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { fetchClientInfo } from '../frontend/utils/fetchClientInfo'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'
import {
  AmplifyClientOAuthProvider,
  useOAuthGetContext,
} from '../frontend/utils/useAmplifyClientOAuthContext'
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
  { requiresSignIn: true, redirectOAuthParams: true },
)

const OAuthPage = ({ clientInfo, dehydratedState }: PageProps) => {
  const { t } = useTranslation('account')
  const { signOut } = useSignOut()
  const [isLoading, setIsLoading] = useState(false)

  const { userAttributes } = useSsrAuth()
  const { email } = userAttributes ?? {}

  const { redirectToOAuthContinueUrl, handleOAuthLogin, clientTitle } =
    useOAuthGetContext(clientInfo)

  const continueHandler = async () => {
    await handleOAuthLogin()

    redirectToOAuthContinueUrl()
  }

  const logoutHandler = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      // TODO: Display error message to the user.
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      <AmplifyClientOAuthProvider clientInfo={clientInfo}>
        <LoginRegisterLayout backButtonHidden>
          <AccountContainer>
            <AccountSuccessAlert
              title={t('auth.oauth_page.title')}
              description={t('auth.oauth_page.description', { email })}
              confirmLabel={t('auth.oauth_page.confirm_label', { clientTitle })}
              onConfirm={continueHandler}
              confirmIsLoading={isLoading}
              cancelLabel={t('auth.oauth_page.cancel_label')}
              onCancel={logoutHandler}
              cancelIsLoading={isLoading}
            />
          </AccountContainer>
        </LoginRegisterLayout>
      </AmplifyClientOAuthProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(OAuthPage)
