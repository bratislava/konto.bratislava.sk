import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import logger from 'frontend/utils/logger'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { useQueryParamRedirect } from '../frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '../frontend/hooks/useSsrAuth'
import { useSignOut } from '../frontend/utils/amplifyClient'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(
  async () => {
    return {
      props: {
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true, redirectQueryParam: true },
)

const LogoutPage = () => {
  const { userAttributes } = useSsrAuth()
  const { t } = useTranslation('account')
  const { signOut } = useSignOut()
  const { redirect } = useQueryParamRedirect()
  const [isLoading, setIsLoading] = useState(false)

  const logoutHandler = async () => {
    setIsLoading(true)
    try {
      logger.info(
        `[AUTH] Attempting to sign out email ${userAttributes?.email}, user agent ${window.navigator.userAgent}`,
      )
      await signOut()
      logger.info(
        `[AUTH] Successfully signed out email ${userAttributes?.email}, user agent ${window.navigator.userAgent}`,
      )
    } catch (error) {
      logger.error(
        `[AUTH] Failed to sign out email ${userAttributes?.email}, user agent ${window.navigator.userAgent}`,
        error,
      )
      // TODO: Display error message to the user.
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LoginRegisterLayout backButtonHidden>
      <AccountContainer className="mb-0 md:mb-8 md:pt-6">
        <AccountSuccessAlert
          title={t('logout_page.title')}
          description={t('logout_page.description')}
          confirmLabel={t('logout_page.confirm_label')}
          onConfirm={logoutHandler}
          confirmIsLoading={isLoading}
          cancelLabel={t('logout_page.cancel_label')}
          onCancel={() => redirect()}
        />
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

export default SsrAuthProviderHOC(LogoutPage)
