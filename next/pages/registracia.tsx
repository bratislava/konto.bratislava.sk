import { ParsedUrlQuery } from 'node:querystring'

import { autoSignIn, confirmSignUp, resendSignUpCode, signUp } from 'aws-amplify/auth'
import AccountActivator from 'components/forms/segments/AccountActivator/AccountActivator'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import RegisterForm from 'components/forms/segments/RegisterForm/RegisterForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { UserAttributes } from 'frontend/dtos/accountDto'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { ROUTES } from '../frontend/api/constants'
import { useQueryParamRedirect } from '../frontend/hooks/useQueryParamRedirect'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import logger from '../frontend/utils/logger'
import { SafeRedirectType } from '../frontend/utils/queryParamRedirect'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'
import { loginConfirmSignUpEmailHiddenQueryParam } from './prihlasenie'

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
  { requiresSignOut: true, redirectQueryParam: true },
)

const getInitialState = (query: ParsedUrlQuery) => {
  const email = query[loginConfirmSignUpEmailHiddenQueryParam]
  // In case user wanted to login, but needs to verify email, he/she is redirected to registration page with email in query
  // to act as if he/she was registering.
  if (email && typeof email === 'string') {
    return { registrationStatus: RegistrationStatus.EMAIL_VERIFICATION_REQUIRED, lastEmail: email }
  }

  return { registrationStatus: RegistrationStatus.INIT, lastEmail: '' }
}

const RegisterPage = () => {
  const router = useRouter()
  const { safeRedirect, getRouteWithRedirect, redirect } = useQueryParamRedirect()
  /* When users registers by redirecting from 3rd party site (query param contains redirect to the site), we don't want
  to force them to unnecessary identity verification. */
  const verificationRequired = safeRedirect.type === SafeRedirectType.Local

  const { t } = useTranslation('account')
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(
    getInitialState(router.query).registrationStatus,
  )
  const [registrationError, setRegistrationError] = useState<Error | null>(null)
  const [lastEmail, setLastEmail] = useState<string>(getInitialState(router.query).lastEmail)

  // only divert user from verification if he's coming from another site

  const handleSignUp = async (
    email: string,
    password: string,
    turnstileToken: string,
    data: UserAttributes,
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
                    .push(getRouteWithRedirect(ROUTES.IDENTITY_VERIFICATION))
                    .catch(() => logger.error(`${GENERIC_ERROR_MESSAGE} redirect failed`))
                : redirect()
            }
            cancelLabel={verificationRequired ? t('identity_verification_skip') : undefined}
            onCancel={verificationRequired ? () => redirect() : undefined}
          />
        )}
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

export default SsrAuthProviderHOC(RegisterPage)
