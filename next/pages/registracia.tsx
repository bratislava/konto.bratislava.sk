import { Auth } from 'aws-amplify'
import AccountActivator from 'components/forms/segments/AccountActivator/AccountActivator'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import RegisterForm from 'components/forms/segments/RegisterForm/RegisterForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { getSSRCurrentAuth } from 'components/logic/ServerSideAuthProvider'
import { AccountError, UserData } from 'frontend/dtos/accountDto'
import useSSORedirect from 'frontend/hooks/useSSORedirect'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import { ROUTES } from '../frontend/api/constants'
import { isProductionDeployment } from '../frontend/utils/general'
import logger from '../frontend/utils/logger'
import { formatUnicorn } from '../frontend/utils/string'
import { AsyncServerProps } from '../frontend/utils/types'

enum RegistrationStatus {
  INIT = 'INIT',
  EMAIL_VERIFICATION_REQUIRED = 'EMAIL_VERIFICATION_REQUIRED',
  EMAIL_VERIFCATION_SUCCESS = 'EMAIL_VERIFCATION_SUCCESS',
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
      isProductionDeploy: isProductionDeployment(),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const RegisterPage = ({
  page,
  isProductionDeploy,
}: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(
    RegistrationStatus.INIT,
  )
  const [registrationError, setRegistrationError] = useState<AccountError | null>(null)
  const [lastEmail, setLastEmail] = useState<string>('')
  const router = useRouter()
  const { redirect, redirectTargetIsAnotherPage } = useSSORedirect()
  // only divert user from verification if he's coming from another site
  const preVerificationRedirect = redirectTargetIsAnotherPage

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
      // subscribeApi({}).catch((error) => logger.error('Failed to subscribe', email, error))
    } catch (error) {
      setRegistrationError({ code: error?.code, message: error?.message })
    }
  }

  const resendVerificationCode = async () => {
    try {
      setRegistrationError(null)
      await Auth.resendSignUp(lastEmail)
    } catch (error) {
      setRegistrationError({ code: error?.code, message: error?.message })
    }
  }

  const verifyEmail = async (code: string) => {
    try {
      setRegistrationError(null)
      await Auth.confirmSignUp(lastEmail, code)
    } catch (error) {
      setRegistrationError({ code: error?.code, message: error?.message })
    }
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        {registrationStatus === RegistrationStatus.INIT && <AccountActivator />}
        <AccountContainer className="md:pt-6 pt-0 mb-0 md:mb-8">
          {registrationStatus === RegistrationStatus.INIT ? (
            <RegisterForm
              lastEmail={lastEmail}
              onSubmit={signUp}
              error={registrationError}
              disablePO={isProductionDeploy}
            />
          ) : registrationStatus === RegistrationStatus.EMAIL_VERIFICATION_REQUIRED ? (
            <EmailVerificationForm
              lastEmail={lastEmail}
              onResend={resendVerificationCode}
              onSubmit={verifyEmail}
              error={registrationError}
            />
          ) : preVerificationRedirect ? (
            <AccountSuccessAlert
              title={t('register_success_title')}
              description={formatUnicorn(t('register_success_description'), {
                email: lastEmail,
              })}
              confirmLabel={t('identity_verification_link')}
              onConfirm={redirect}
            />
          ) : (
            <AccountSuccessAlert
              title={t('register_success_title')}
              description={formatUnicorn(t('register_success_description'), {
                email: lastEmail,
              })}
              confirmLabel={t('identity_verification_link')}
              onConfirm={() => {
                router
                  .push(ROUTES.IDENTITY_VERIFICATION)
                  .catch((error_) => logger.error('Failed redirect', error_))
              }}
              cancelLabel={t('identity_verification_skip')}
              onCancel={() =>
                router.push({ pathname: ROUTES.HOME, query: { from: ROUTES.REGISTER } })
              }
            >
              <AccountMarkdown
                className="text-center"
                content={t('register_success_content')}
                variant="sm"
              />
            </AccountSuccessAlert>
          )}
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default RegisterPage
