import { Auth } from 'aws-amplify'
import AccountActivator from 'components/forms/segments/AccountActivator/AccountActivator'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import RegisterForm from 'components/forms/segments/RegisterForm/RegisterForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { UserData } from 'frontend/dtos/accountDto'
import useLoginRegisterRedirect from 'frontend/hooks/useLoginRegisterRedirect'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import { environment } from '../environment'
import { ROUTES } from '../frontend/api/constants'
import logger from '../frontend/utils/logger'
import { AsyncServerProps } from '../frontend/utils/types'

enum RegistrationStatus {
  INIT = 'INIT',
  EMAIL_VERIFICATION_REQUIRED = 'EMAIL_VERIFICATION_REQUIRED',
  EMAIL_VERIFICATION_SUCCESS = 'EMAIL_VERIFICATION_SUCCESS',
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),
      page: {
        locale: ctx.locale,
        localizations: ['sk', 'en']
          .filter((l) => l !== ctx.locale)
          .map((l) => ({
            slug: '',
            locale: l,
          })),
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

const RegisterPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(
    RegistrationStatus.INIT,
  )
  const [registrationError, setRegistrationError] = useState<Error | null>(null)
  const [lastEmail, setLastEmail] = useState<string>('')
  const router = useRouter()
  const { redirect, verificationRequired } = useLoginRegisterRedirect()
  // only divert user from verification if he's coming from another site

  const signUp = async (
    email: string,
    password: string,
    turnstileToken: string,
    data: UserData,
  ) => {
    try {
      setRegistrationError(null)
      setLastEmail(email)
      await Auth.signUp({
        username: email,
        password,
        attributes: data,
        autoSignIn: {
          enabled: true,
        },
        validationData: {
          'custom:turnstile_token': turnstileToken,
        },
      })
      setRegistrationStatus(RegistrationStatus.EMAIL_VERIFICATION_REQUIRED)
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
      await Auth.resendSignUp(lastEmail)
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

  const verifyEmail = async (code: string) => {
    try {
      setRegistrationError(null)
      await Auth.confirmSignUp(lastEmail, code)
      setRegistrationStatus(RegistrationStatus.EMAIL_VERIFICATION_SUCCESS)
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
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        {registrationStatus === RegistrationStatus.INIT && <AccountActivator />}
        <AccountContainer className="mb-0 pt-0 md:mb-8 md:pt-6">
          {registrationStatus === RegistrationStatus.INIT ? (
            <RegisterForm
              lastEmail={lastEmail}
              onSubmit={signUp}
              error={registrationError}
              disablePO={!environment.featureToggles.pravnickaOsobaRegistration}
            />
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
              onCancel={
                verificationRequired ? () => redirect({ from: ROUTES.REGISTER }) : undefined
              }
            />
          )}
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default ServerSideAuthProviderHOC(RegisterPage)
