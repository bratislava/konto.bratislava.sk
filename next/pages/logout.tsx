import { signOut } from 'aws-amplify/auth'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import useLoginRegisterRedirect from 'frontend/hooks/useLoginRegisterRedirect'
import { GENERIC_ERROR_MESSAGE } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { useSsrAuth } from '../frontend/hooks/useSsrAuth'
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
  { requiresSignOut: true },
)

const LogoutPage = () => {
  const { t } = useTranslation('account')
  const { isSignedIn } = useSsrAuth()
  const { redirect } = useLoginRegisterRedirect()
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    if (!isSignedIn) {
      redirect().catch((error) => logger.error('Failed redirect logout useEffect', error))
    }
  }, [isSignedIn, redirect])

  const logoutHandler = async () => {
    setIsLoading(true)
    try {
      await signOut()
      await redirect()
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
