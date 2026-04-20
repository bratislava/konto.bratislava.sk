import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'

import { strapiClient } from '@/src/clients/graphql-strapi'
import AccountContainer from '@/src/components/layouts/AccountContainer'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import AccountSuccessAlert from '@/src/components/segments/AccountSuccessAlert/AccountSuccessAlert'
import {
  AmplifyClientOAuthProvider,
  useOAuthGetContext,
} from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import { useQueryParamRedirect } from '@/src/frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { prefetchUserQuery } from '@/src/frontend/hooks/useUser'
import { useSignOut } from '@/src/frontend/utils/amplifyClient'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { fetchClientInfo } from '@/src/frontend/utils/fetchClientInfo'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'
import { AuthPageCommonProps } from '@/src/pages/prihlasenie'
import { ROUTES } from '@/src/utils/routes'

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
  { requiresSignIn: true, redirectOAuthParams: true },
)

const OAuthPage = ({ general, clientInfo, dehydratedState }: PageProps) => {
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
        <GeneralContextProvider general={general}>
          <PageLayout variant="auth" hideBackButton>
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
        </GeneralContextProvider>
      </AmplifyClientOAuthProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(OAuthPage)
