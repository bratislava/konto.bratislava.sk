import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { GENERIC_ERROR_MESSAGE } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { useQueryParamRedirect } from '../frontend/hooks/useQueryParamRedirect'
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
  const { t } = useTranslation('account')
  const { signOut } = useSignOut()
  const { redirect } = useQueryParamRedirect()
  const [isLoading, setIsLoading] = useState(false)

  const logoutHandler = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      logger.error(`${GENERIC_ERROR_MESSAGE} logout screen`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LoginRegisterLayout backButtonHidden>
      <AccountContainer className="mb-0 pt-0 md:mb-8 md:pt-6">
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
