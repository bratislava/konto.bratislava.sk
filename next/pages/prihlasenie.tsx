import { Auth } from 'aws-amplify'
import AccountActivator from 'components/forms/segments/AccountActivator/AccountActivator'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import LoginForm from 'components/forms/segments/LoginForm/LoginForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import useSSORedirect from 'frontend/hooks/useSSORedirect'
import { AccountError, AccountStatus, getSSRCurrentAuth } from 'frontend/utils/amplify'
import logger from 'frontend/utils/logger'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect, useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import { isProductionDeployment } from '../frontend/utils/general'
import { AsyncServerProps } from '../frontend/utils/types'
import {
  useDerivedServerSideAuthState,
  useIsAuthenticated,
  useServerSideAuth,
  useTier,
} from 'frontend/hooks/useServerSideAuth'

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

const LoginPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { redirect } = useSSORedirect()
  const { isAuthenticated, tierStatus } = useDerivedServerSideAuthState()
  const [loginError, setLoginError] = useState<AccountError | null>(null)

  // TODO handle verification required through Hub
  const [loginStatus, setLoginStatus] = useState<'Init' | 'EmailVerificationRequired'>('Init')

  useEffect(() => {
    if (isAuthenticated) {
      redirect().catch((error) => logger.error('Failed redirect login useEffect', error))
    }
  }, [isAuthenticated, redirect])

  const onLogin = async (email: string, password: string) => {
    try {
      if (await Auth.signIn(email, password)) {
        await redirect()
      }
    } catch (error) {
      setLoginError({ code: error?.code, message: error?.message })
    }
  }

  const onVerifyEmail = async (verificationCode: string) => {
    try {
      if (await Auth.verifyCurrentUserAttributeSubmit('email', verificationCode)) {
        await redirect()
      }
    } catch (error) {
      setLoginError({ code: error?.code, message: error?.message })
    }
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        {!isAuthenticated && <AccountActivator />}
        <AccountContainer className="md:pt-6 pt-0 mb-0 md:mb-8">
          {status === AccountStatus.EmailVerificationRequired ? (
            <EmailVerificationForm
              onResend={() => Auth.verifyCurrentUserAttribute('email')}
              onSubmit={onVerifyEmail}
              error={loginError}
            />
          ) : (
            <LoginForm onSubmit={onLogin} error={loginError} />
          )}
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default LoginPage
