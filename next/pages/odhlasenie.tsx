import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import AccountContainer from '@/components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from '@/components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import PageLayout from '@/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/components/logic/SsrAuthContext'
import { useQueryParamRedirect } from '@/frontend/hooks/useQueryParamRedirect'
import { useSignOut } from '@/frontend/utils/amplifyClient'
import { amplifyGetServerSideProps } from '@/frontend/utils/amplifyServer'
import { fetchClientInfo } from '@/frontend/utils/fetchClientInfo'
import { slovakServerSideTranslations } from '@/frontend/utils/slovakServerSideTranslations'
import { AmplifyClientOAuthProvider } from '@/frontend/utils/useAmplifyClientOAuthContext'

import { AuthPageCommonProps } from './prihlasenie'

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context }) => {
    const clientInfo = await fetchClientInfo(context.query)

    return {
      props: {
        clientInfo,
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true, redirectQueryParam: true },
)

const LogoutPage = ({ clientInfo }: AuthPageCommonProps) => {
  const { t } = useTranslation('account')
  const { signOut } = useSignOut()
  const { redirect } = useQueryParamRedirect()
  const [isLoading, setIsLoading] = useState(false)

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
    <AmplifyClientOAuthProvider clientInfo={clientInfo}>
      <PageLayout variant="auth" hideBackButton>
        <AccountContainer>
          <AccountSuccessAlert
            variant="logout"
            title={t('auth.logout_page.title')}
            description={t('auth.logout_page.description')}
            confirmLabel={t('auth.logout_page.confirm_label')}
            onConfirm={handleLogout}
            confirmIsLoading={isLoading}
            cancelLabel={t('auth.logout_page.cancel_label')}
            onCancel={() => redirect()}
          />
        </AccountContainer>
      </PageLayout>
    </AmplifyClientOAuthProvider>
  )
}

export default SsrAuthProviderHOC(LogoutPage)
