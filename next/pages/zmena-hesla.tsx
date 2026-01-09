import { updatePassword } from 'aws-amplify/auth'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'

import PasswordChangeForm from '../components/forms/auth-forms/PasswordChangeForm'
import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { ROUTES } from '../frontend/api/constants'
import { useSsrAuth } from '../frontend/hooks/useSsrAuth'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import logger from '../frontend/utils/logger'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

enum PasswordChangeStatus {
  INIT = 'INIT',
  NEW_PASSWORD_SUCCESS = 'NEW_PASSWORD_SUCCESS',
}

export const getServerSideProps = amplifyGetServerSideProps(
  async () => {
    return {
      props: {
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const PasswordChangePage = () => {
  const { userAttributes } = useSsrAuth()

  const { t } = useTranslation('account')
  const router = useRouter()
  const [passwordChangeError, setPasswordChangeError] = useState<Error | null>(null)
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<PasswordChangeStatus>(
    PasswordChangeStatus.INIT,
  )

  const accountContainerRef = useRef<HTMLDivElement>(null)

  const handleErrorChange = (error: Error | null) => {
    setPasswordChangeError(error)

    if (error) {
      accountContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const onConfirm = async () => {
    await router.push(ROUTES.HOME).catch((error_) => logger.error('Failed redirect', error_))
  }

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      logger.info(`[AUTH] Attempting to change password for email ${userAttributes?.email}`)
      handleErrorChange(null)
      await updatePassword({
        oldPassword,
        newPassword,
      })
      logger.info(`[AUTH] Successfully changed password for email ${userAttributes?.email}`)
      setPasswordChangeStatus(PasswordChangeStatus.NEW_PASSWORD_SUCCESS)
    } catch (error) {
      logger.error(`[AUTH] Failed to change password for email ${userAttributes?.email}`, error)
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  return (
    <LoginRegisterLayout
      backButtonHidden={passwordChangeStatus === PasswordChangeStatus.NEW_PASSWORD_SUCCESS}
    >
      <AccountContainer ref={accountContainerRef}>
        {passwordChangeStatus === PasswordChangeStatus.NEW_PASSWORD_SUCCESS ? (
          <AccountSuccessAlert
            title={t('auth.password_change_success_title')}
            confirmLabel={t('auth.continue_to_account')}
            onConfirm={onConfirm}
          />
        ) : (
          <PasswordChangeForm onSubmit={changePassword} error={passwordChangeError} />
        )}
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

export default SsrAuthProviderHOC(PasswordChangePage)
