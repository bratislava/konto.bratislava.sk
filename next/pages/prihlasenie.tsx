import { Auth } from 'aws-amplify'
import AccountActivator from 'components/forms/segments/AccountActivator/AccountActivator'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import LoginForm from 'components/forms/segments/LoginForm/LoginForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { getSSRCurrentAuth } from 'components/logic/ServerSideAuthProvider'
import { AccountError } from 'frontend/dtos/accountDto'
import { useDerivedServerSideAuthState } from 'frontend/hooks/useServerSideAuth'
import useSSORedirect from 'frontend/hooks/useSSORedirect'
import logger from 'frontend/utils/logger'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect, useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import { isProductionDeployment } from '../frontend/utils/general'
import { AsyncServerProps } from '../frontend/utils/types'

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
  const { isAuthenticated } = useDerivedServerSideAuthState()
  const [loginError, setLoginError] = useState<AccountError | null>(null)
  // if email is not yet verify login will fail - we stay on this page & render verification form for the last used email
  const [emailToVerify, setEmailToVerify] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      redirect().catch((error) => logger.error('Failed redirect login useEffect', error))
    }
  }, [isAuthenticated, redirect])

  const onLogin = async (email: string, password: string) => {
    // TODO move this down
    try {
      const loginResult = await Auth.signIn(email, password)
      if (loginResult) {
        await redirect()
      } else {
        // TODO clean once validated
        console.log(loginResult)
      }
    } catch (error) {
      // TODO continue here - get the exact error, only then set emailToVerify
      setEmailToVerify(email)
      console.error(error)
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
          {emailToVerify ? (
            <EmailVerificationForm
              onResend={() => Auth.verifyCurrentUserAttribute('email')}
              onSubmit={onVerifyEmail}
              error={loginError}
              lastEmail={emailToVerify}
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
