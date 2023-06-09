import AccountActivator from 'components/forms/segments/AccountActivator/AccountActivator'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import LoginForm from 'components/forms/segments/LoginForm/LoginForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import useSSORedirect from 'frontend/hooks/useSSORedirect'
import logger from 'frontend/utils/logger'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import useAccount, { AccountStatus } from '../frontend/hooks/useAccount'
import { isProductionDeployment } from '../frontend/utils/general'
import { AsyncServerProps } from '../frontend/utils/types'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
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

const LoginPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { login, error, status, resendVerificationCode, verifyEmail, lastEmail, user } =
    useAccount()
  const { redirect } = useSSORedirect()

  useEffect(() => {
    if (user !== null && user !== undefined) {
      redirect().catch((error) => logger.error('Failed redirect login useEffect', error))
    }
  }, [user, redirect])

  const onLogin = async (email: string, password: string) => {
    if (await login(email, password)) {
      await redirect()
    }
  }

  const onVerifyEmail = async (verificationCode: string) => {
    if (await verifyEmail(verificationCode)) {
      await redirect()
    }
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        {status === AccountStatus.Idle && <AccountActivator />}
        <AccountContainer className="md:pt-6 pt-0 mb-0 md:mb-8">
          {status === AccountStatus.EmailVerificationRequired ? (
            <EmailVerificationForm
              lastEmail={lastEmail}
              onResend={resendVerificationCode}
              onSubmit={onVerifyEmail}
              error={error}
            />
          ) : (
            <LoginForm onSubmit={onLogin} error={error} />
          )}
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default LoginPage
