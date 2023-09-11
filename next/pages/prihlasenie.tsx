import { Auth } from 'aws-amplify'
import AccountActivator from 'components/forms/segments/AccountActivator/AccountActivator'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import LoginForm from 'components/forms/segments/LoginForm/LoginForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import useLoginRegisterRedirect from 'frontend/hooks/useLoginRegisterRedirect'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { GENERIC_ERROR_MESSAGE, isError, isErrorWithCode } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useCallback, useEffect, useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
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
      ...(await serverSideTranslations(locale)),
    },
  }
}

const LoginPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { redirect } = useLoginRegisterRedirect()
  const { isAuthenticated } = useServerSideAuth()
  const [loginError, setLoginError] = useState<Error | null>(null)
  // if email is not yet verify login will fail - we stay on this page & render verification form for the last used email
  const [emailToVerify, setEmailToVerify] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      redirect().catch((error) => logger.error('Failed redirect login useEffect', error))
    }
  }, [isAuthenticated, redirect])

  const onLogin = async (email: string, password: string) => {
    try {
      const loginResult = await Auth.signIn(email, password)
      if (loginResult) {
        await redirect()
      }
    } catch (error) {
      if (isError(error)) {
        setLoginError(error)
        if (isErrorWithCode(error) && error.code === 'UserNotConfirmedException') {
          setEmailToVerify(email)
        }
      } else {
        logger.error(`${GENERIC_ERROR_MESSAGE} - unexpected object thrown in onVerifyEmail:`, error)
        setLoginError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const onVerifyEmail = useCallback(
    async (verificationCode: string) => {
      try {
        if (await Auth.confirmSignUp(emailToVerify, verificationCode)) {
          await redirect()
        }
      } catch (error) {
        if (isError(error)) {
          setLoginError(error)
        } else {
          logger.error(
            `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in onVerifyEmail:`,
            error,
          )
          setLoginError(new Error(GENERIC_ERROR_MESSAGE))
        }
      }
    },
    [emailToVerify, redirect],
  )

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        {!isAuthenticated && <AccountActivator />}
        <AccountContainer className="mb-0 pt-0 md:mb-8 md:pt-6">
          {emailToVerify ? (
            <EmailVerificationForm
              onResend={() => Auth.resendSignUp(emailToVerify)}
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

export default ServerSideAuthProviderHOC(LoginPage)
