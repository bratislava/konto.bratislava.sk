import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { strapiClient } from '@/src/clients/graphql-strapi'
import AccountContainer from '@/src/components/layouts/AccountContainer'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import AccountSuccessAlert from '@/src/components/segments/AccountSuccessAlert/AccountSuccessAlert'
import { AmplifyClientOAuthProvider } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import { useQueryParamRedirect } from '@/src/frontend/hooks/useQueryParamRedirect'
import { useSignOut } from '@/src/frontend/utils/amplifyClient'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { fetchClientInfo } from '@/src/frontend/utils/fetchClientInfo'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'
import { AuthPageCommonProps } from '@/src/pages/prihlasenie'

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context }) => {
    const [general, clientInfo] = await Promise.all([
      strapiClient.General(),
      fetchClientInfo(context.query),
    ])

    return {
      props: {
        general,
        clientInfo,
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true, redirectQueryParam: true },
)

const LogoutPage = ({ general, clientInfo }: AuthPageCommonProps) => {
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
      <GeneralContextProvider general={general}>
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
      </GeneralContextProvider>
    </AmplifyClientOAuthProvider>
  )
}

export default SsrAuthProviderHOC(LogoutPage)
