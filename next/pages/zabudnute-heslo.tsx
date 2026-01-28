import { confirmResetPassword, resetPassword } from 'aws-amplify/auth'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import PageLayout from 'components/layouts/PageLayout'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'

import ForgottenPasswordForm from '../components/forms/auth-forms/ForgottenPasswordForm'
import NewPasswordForm from '../components/forms/auth-forms/NewPasswordForm'
import HorizontalDivider from '../components/forms/HorizontalDivider'
import AccountLink from '../components/forms/segments/AccountLink/AccountLink'
import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { ROUTES } from '../frontend/api/constants'
import { useQueryParamRedirect } from '../frontend/hooks/useQueryParamRedirect'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import logger from '../frontend/utils/logger'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

enum ForgotPasswordStatus {
  INIT = 'INIT',
  NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
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
  { requiresSignOut: true, redirectQueryParam: true },
)

const ForgottenPasswordPage = () => {
  const [lastEmail, setLastEmail] = useState('')
  const [forgotPasswordError, setForgotPasswordError] = useState<Error | null>(null)
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<ForgotPasswordStatus>(
    ForgotPasswordStatus.INIT,
  )
  const { t } = useTranslation('account')
  const router = useRouter()
  const { getRouteWithRedirect } = useQueryParamRedirect()
  const accountContainerRef = useRef<HTMLDivElement>(null)

  const handleErrorChange = (error: Error | null) => {
    setForgotPasswordError(error)

    if (error) {
      accountContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const onConfirm = async () => {
    await router
      .push(getRouteWithRedirect(ROUTES.LOGIN))
      .catch((error) => logger.error('Failed redirect', error))
  }

  const forgotPassword = async (email: string) => {
    try {
      logger.info(`[AUTH] Attempting to request password reset for email ${email}`)
      setLastEmail(email)
      const result = await resetPassword({ username: email })
      if (result.nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        logger.info(`[AUTH] Successfully requested password reset for email ${email}`)
        setForgotPasswordStatus(ForgotPasswordStatus.NEW_PASSWORD_REQUIRED)
      } else {
        throw new Error(
          `Unknown "nextStep" after trying to request password reset: ${JSON.stringify(result.nextStep)}`,
        )
      }
    } catch (error) {
      logger.error(`[AUTH] Failed to request password reset for email ${email}`, error)
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const forgotPasswordSubmit = async (confirmationCode: string, newPassword: string) => {
    try {
      logger.info(`[AUTH] Attempting to reset password for email ${lastEmail}`)
      await confirmResetPassword({
        username: lastEmail,
        confirmationCode,
        newPassword,
      })
      logger.info(`[AUTH] Successfully reset password for email ${lastEmail}`)
      setForgotPasswordStatus(ForgotPasswordStatus.NEW_PASSWORD_SUCCESS)
    } catch (error) {
      logger.error(`[AUTH] Failed to reset password for email ${lastEmail}`, error)
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  return (
    <PageLayout variant="login-register"
      hideBackButton={forgotPasswordStatus === ForgotPasswordStatus.NEW_PASSWORD_SUCCESS}
    >
      <AccountContainer ref={accountContainerRef} className="flex flex-col gap-8 md:gap-10">
        {forgotPasswordStatus === ForgotPasswordStatus.NEW_PASSWORD_REQUIRED ? (
          <NewPasswordForm
            onSubmit={(verificationCode, newPassword) =>
              forgotPasswordSubmit(verificationCode, newPassword)
            }
            onResend={() => forgotPassword(lastEmail)}
            error={forgotPasswordError}
            lastEmail={lastEmail}
          />
        ) : forgotPasswordStatus === ForgotPasswordStatus.INIT ? (
          <>
            <ForgottenPasswordForm
              onSubmit={(email: string) => forgotPassword(email)}
              error={forgotPasswordError}
              lastEmail={lastEmail}
              setLastEmail={setLastEmail}
            />
            <HorizontalDivider />
            <AccountLink variant="login" />
          </>
        ) : (
          <AccountSuccessAlert
            title={t('auth.forgotten_password_success_title')}
            confirmLabel={t('auth.forgotten_password_success_go_to_login')}
            onConfirm={onConfirm}
          />
        )}
      </AccountContainer>
    </PageLayout>
  )
}

export default SsrAuthProviderHOC(ForgottenPasswordPage)
