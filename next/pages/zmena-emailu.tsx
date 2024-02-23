import { Auth } from 'aws-amplify'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import EmailChangeForm from 'components/forms/segments/EmailChangeForm/EmailChangeForm'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect, useState } from 'react'

import { ROUTES } from '../frontend/api/constants'
import logger from '../frontend/utils/logger'

enum EmailChangeStatus {
  INIT = 'INIT',
  EMAIL_VERIFICATION_REQUIRED = 'EMAIL_VERIFICATION_REQUIRED',
  EMAIL_VERIFICATION_SUCCESS = 'EMAIL_VERIFICATION_SUCCESS',
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const EmailChangePage = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const [emailChangeStatus, setEmailChangeStatus] = useState<EmailChangeStatus>(
    EmailChangeStatus.INIT,
  )
  const [lastEmail, setLastEmail] = useState<string>('')
  const [emailChangeError, setEmailChangeError] = useState<Error | null>(null)

  const { isAuthenticated } = useServerSideAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN).catch((error_) => logger.error('Failed redirect', error_))
    }
  }, [isAuthenticated, router])

  const resendVerificationCode = async () => {
    try {
      setEmailChangeError(null)
      await Auth.verifyCurrentUserAttribute('email')
    } catch (error) {
      if (isError(error)) {
        setEmailChangeError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in resendVerificationCode:`,
          error,
        )
        setEmailChangeError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const verifyEmail = async (code: string) => {
    try {
      setEmailChangeError(null)
      await Auth.verifyCurrentUserAttributeSubmit('email', code)
      setEmailChangeStatus(EmailChangeStatus.EMAIL_VERIFICATION_SUCCESS)
    } catch (error) {
      if (isError(error)) {
        setEmailChangeError(error)
      } else {
        logger.error(`${GENERIC_ERROR_MESSAGE} - unexpected object thrown in verifyEmail:`, error)
        setEmailChangeError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const changeEmail = async (newEmail: string, password: string) => {
    try {
      setEmailChangeError(null)
      setLastEmail(newEmail)
      const user = (await Auth.currentAuthenticatedUser()) as {
        attributes: { email: string }
      }
      // check if password is correct
      await Auth.signIn(user.attributes.email, password)
      await Auth.updateUserAttributes(user, { email: newEmail })
      setEmailChangeStatus(EmailChangeStatus.EMAIL_VERIFICATION_REQUIRED)
    } catch (error) {
      if (isError(error)) {
        setEmailChangeError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in forgotPasswordSubmit:`,
          error,
        )
        setEmailChangeError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const onConfirm = async () => {
    await router.push(ROUTES.HOME).catch((error_) => logger.error('Failed redirect', error_))
  }

  return (
    <LoginRegisterLayout
      backButtonHidden={emailChangeStatus === EmailChangeStatus.EMAIL_VERIFICATION_SUCCESS}
    >
      <AccountContainer>
        {emailChangeStatus === EmailChangeStatus.INIT ? (
          <EmailChangeForm onSubmit={changeEmail} error={emailChangeError} />
        ) : emailChangeStatus === EmailChangeStatus.EMAIL_VERIFICATION_REQUIRED ? (
          <EmailVerificationForm
            lastEmail={lastEmail}
            onResend={resendVerificationCode}
            onSubmit={verifyEmail}
            error={emailChangeError}
          />
        ) : (
          <AccountSuccessAlert
            title={t('email_change_success_title')}
            confirmLabel={t('account_continue_link')}
            onConfirm={onConfirm}
            description={t('email_change_success_description', { email: lastEmail })}
          />
        )}
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

export default ServerSideAuthProviderHOC(EmailChangePage)
