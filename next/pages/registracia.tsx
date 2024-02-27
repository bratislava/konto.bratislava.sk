import { autoSignIn, confirmSignUp, resendSignUpCode, signUp } from 'aws-amplify/auth'
import AccountActivator from 'components/forms/segments/AccountActivator/AccountActivator'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import RegisterForm from 'components/forms/segments/RegisterForm/RegisterForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { UserData } from 'frontend/dtos/accountDto'
import useLoginRegisterRedirect from 'frontend/hooks/useLoginRegisterRedirect'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { ROUTES } from '../frontend/api/constants'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import logger from '../frontend/utils/logger'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

enum RegistrationStatus {
  INIT = 'INIT',
  EMAIL_VERIFICATION_REQUIRED = 'EMAIL_VERIFICATION_REQUIRED',
  EMAIL_VERIFICATION_SUCCESS = 'EMAIL_VERIFICATION_SUCCESS',
}

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

const RegisterPage = () => {
  const { t } = useTranslation('account')
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(
    RegistrationStatus.INIT,
  )
  const [registrationError, setRegistrationError] = useState<Error | null>(null)
  const [lastEmail, setLastEmail] = useState<string>('')
  const router = useRouter()
  const { redirect, verificationRequired } = useLoginRegisterRedirect()
  // only divert user from verification if he's coming from another site

  const handleSignUp = async (
    email: string,
    password: string,
    turnstileToken: string,
    data: UserData,
  ) => {
    try {
      setRegistrationError(null)
      setLastEmail(email)
      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: data,
          autoSignIn: true,
          validationData: {
            'custom:turnstile_token': turnstileToken,
          },
        },
      })
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setRegistrationStatus(RegistrationStatus.EMAIL_VERIFICATION_REQUIRED)
      } else {
        throw new Error('Unknown error')
      }
    } catch (error) {
      if (isError(error)) {
        setRegistrationError(error)
      } else {
        logger.error(`${GENERIC_ERROR_MESSAGE} - unexpected object thrown in signUp:`, error)
        setRegistrationError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const resendVerificationCode = async () => {
    try {
      setRegistrationError(null)
      await resendSignUpCode({ username: lastEmail })
    } catch (error) {
      if (isError(error)) {
        setRegistrationError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in resendVerificationCode:`,
          error,
        )
        setRegistrationError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const handleAutoSignIn = async () => {
    try {
      const { isSignedIn } = await autoSignIn()
      if (isSignedIn) {
        setRegistrationStatus(RegistrationStatus.EMAIL_VERIFICATION_SUCCESS)
      } else {
        throw new Error('Unknown error')
      }
    } catch (error) {
      if (isError(error)) {
        setRegistrationError(error)
      } else {
        logger.error(`${GENERIC_ERROR_MESSAGE} - unexpected object thrown in verifyEmail:`, error)
        setRegistrationError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const verifyEmail = async (confirmationCode: string) => {
    try {
      setRegistrationError(null)
      const { nextStep } = await confirmSignUp({
        username: lastEmail,
        confirmationCode,
      })
      if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        await handleAutoSignIn()
      } else {
        throw new Error('Unknown error')
      }
    } catch (error) {
      if (isError(error)) {
        setRegistrationError(error)
      } else {
        logger.error(`${GENERIC_ERROR_MESSAGE} - unexpected object thrown in verifyEmail:`, error)
        setRegistrationError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  return (
    <LoginRegisterLayout backButtonHidden>
      {registrationStatus === RegistrationStatus.INIT && <AccountActivator />}
      <AccountContainer dataCyPrefix="registration" className="mb-0 pt-0 md:mb-8 md:pt-6">
        {registrationStatus === RegistrationStatus.INIT ? (
          <RegisterForm lastEmail={lastEmail} onSubmit={handleSignUp} error={registrationError} />
        ) : registrationStatus === RegistrationStatus.EMAIL_VERIFICATION_REQUIRED ? (
          <EmailVerificationForm
            lastEmail={lastEmail}
            onResend={resendVerificationCode}
            onSubmit={verifyEmail}
            error={registrationError}
          />
        ) : (
          // When verification is not required, the modal has only single button (without cancelLabel/onCancel the second button is not rendered)
          // This single button does the same action (redirects back) as the cancel button does in 2 button version
          <AccountSuccessAlert
            title={t('register_success_title')}
            description={t('register_success_description', { email: lastEmail })}
            confirmLabel={
              verificationRequired
                ? t('identity_verification_link')
                : t('identity_verification_not_required')
            }
            onConfirm={() =>
              verificationRequired
                ? router
                    .push(ROUTES.IDENTITY_VERIFICATION)
                    .catch(() => logger.error(`${GENERIC_ERROR_MESSAGE} redirect failed`))
                : redirect({ from: ROUTES.REGISTER })
            }
            cancelLabel={verificationRequired ? t('identity_verification_skip') : undefined}
            onCancel={verificationRequired ? () => redirect({ from: ROUTES.REGISTER }) : undefined}
          />
        )}
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

export default SsrAuthProviderHOC(RegisterPage)
