import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import PageLayout from 'components/layouts/PageLayout'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { ROUTES } from '../frontend/api/constants'
import { useQueryParamRedirect } from '../frontend/hooks/useQueryParamRedirect'
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
  const router = useRouter()
  const { t } = useTranslation('account')
  const { signOut } = useSignOut()
  const [isLoading, setIsLoading] = useState(false)

  const { userAttributes, tierStatus } = useSsrAuth()
  const { email } = userAttributes ?? {}

  const { getRouteWithRedirect } = useQueryParamRedirect()

  const { storeTokensAndRedirect, clientTitle, isIdentityVerificationRequired } =
    useOAuthGetContext(clientInfo)

  const shouldRedirectToIdentityVerification =
    isIdentityVerificationRequired && !tierStatus.isIdentityVerified

  const handleRedirectToIdentityVerification = async () => {
    router.push(getRouteWithRedirect(ROUTES.IDENTITY_VERIFICATION))
  }

  const handleOAuthContinue = async () => {
    await storeTokensAndRedirect()
  }

  const handleLogout = async () => {
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
        <PageLayout variant="login-register" hideBackButton>
          <AccountContainer>
            <AccountSuccessAlert
              title={t('auth.oauth_page.title')}
              {...(shouldRedirectToIdentityVerification
                ? {
                  variant: 'info',
                  description: `${t('auth.oauth_page.description', { email })}\n\n${t('auth.oauth_page.identity_verification_is_required_info')}`,
                  confirmLabel: t('auth.oauth_page.continue_to_identity_verification'),
                  onConfirm: () => {
                    handleRedirectToIdentityVerification()
                  },
                }
                : {
                  variant: 'success',
                  description: t('auth.oauth_page.description', { email }),
                  confirmLabel: t('auth.oauth_page.continue_to_oauth_origin', { clientTitle }),
                  onConfirm: () => {
                    handleOAuthContinue()
                  },
                })}
              confirmIsLoading={isLoading}
              cancelLabel={t('auth.oauth_page.cancel_label')}
              onCancel={handleLogout}
              cancelIsLoading={isLoading}
            />
          </AccountContainer>
        </PageLayout>
      </AmplifyClientOAuthProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(OAuthPage)
