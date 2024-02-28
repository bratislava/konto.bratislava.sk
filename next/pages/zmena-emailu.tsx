import {
  AuthError,
  confirmUserAttribute,
  sendUserAttributeVerificationCode,
  updatePassword,
  updateUserAttributes,
} from 'aws-amplify/auth'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import EmailChangeForm from 'components/forms/segments/EmailChangeForm/EmailChangeForm'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { ErrorWithName, GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { ROUTES } from '../frontend/api/constants'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import logger from '../frontend/utils/logger'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

enum EmailChangeStatus {
  INIT = 'INIT',
  EMAIL_VERIFICATION_REQUIRED = 'EMAIL_VERIFICATION_REQUIRED',
  EMAIL_VERIFICATION_SUCCESS = 'EMAIL_VERIFICATION_SUCCESS',
}

/**
 * This seems to be the only way how to check if password is correct. In Amplify v5 it was possible to trigger sign in,
 * but in v6 it's not possible to sign in multiple times anymore.
 */
const verifyPassword = async (password: string) => {
  try {
    await updatePassword({
      oldPassword: password,
      newPassword: password,
    })
  } catch (error) {
    if (error instanceof AuthError && error.name === 'NotAuthorizedException') {
      throw new ErrorWithName('Incorrect password', 'IncorrectPasswordException')
    }
    throw error
  }
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

const EmailChangePage = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const [emailChangeStatus, setEmailChangeStatus] = useState<EmailChangeStatus>(
    EmailChangeStatus.INIT,
  )
  const [lastEmail, setLastEmail] = useState<string>('')
  const [emailChangeError, setEmailChangeError] = useState<Error | null>(null)

  const resendVerificationCode = async () => {
    try {
      setEmailChangeError(null)
      await sendUserAttributeVerificationCode({
        userAttributeKey: 'email',
      })
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

  const verifyEmail = async (confirmationCode: string) => {
    try {
      setEmailChangeError(null)
      await confirmUserAttribute({
        userAttributeKey: 'email',
        confirmationCode,
      })
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
      await verifyPassword(password)
      const result = await updateUserAttributes({
        userAttributes: { email: newEmail },
      })
      if (result.email?.nextStep.updateAttributeStep === 'CONFIRM_ATTRIBUTE_WITH_CODE') {
        setEmailChangeStatus(EmailChangeStatus.EMAIL_VERIFICATION_REQUIRED)
      } else {
        throw new Error('Unknown error')
      }
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

export default SsrAuthProviderHOC(EmailChangePage)
