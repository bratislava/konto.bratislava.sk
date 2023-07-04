import { Auth } from 'aws-amplify'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import ForgottenPasswordForm from 'components/forms/segments/ForgottenPasswordForm/ForgottenPasswordForm'
import NewPasswordForm from 'components/forms/segments/NewPasswordForm/NewPasswordForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import { ROUTES } from '../frontend/api/constants'
import logger from '../frontend/utils/logger'
import { AsyncServerProps } from '../frontend/utils/types'

enum ForgotPasswordStatus {
  INIT = 'INIT',
  NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
  NEW_PASSWORD_SUCCESS = 'NEW_PASSWORD_SUCCESS',
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

const ForgottenPasswordPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const [lastEmail, setLastEmail] = useState('')
  const [forgotPasswordError, setForgotPasswordError] = useState<Error | null>(null)
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<ForgotPasswordStatus>(
    ForgotPasswordStatus.INIT,
  )
  const { t } = useTranslation('account')
  const router = useRouter()

  const onConfirm = async () => {
    await router.push(ROUTES.HOME).catch((error) => logger.error('Failed redirect', error))
  }

  const forgotPassword = async (email: string) => {
    try {
      setLastEmail(email)
      await Auth.forgotPassword(email)
      setForgotPasswordStatus(ForgotPasswordStatus.NEW_PASSWORD_REQUIRED)
    } catch (error) {
      if (isError(error)) {
        setForgotPasswordError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in forgotPassword:`,
          error,
        )
        setForgotPasswordError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const forgotPasswordSubmit = async (verificationCode: string, newPassword: string) => {
    try {
      await Auth.forgotPasswordSubmit(lastEmail, verificationCode, newPassword)
      setForgotPasswordStatus(ForgotPasswordStatus.NEW_PASSWORD_SUCCESS)
    } catch (error) {
      if (isError(error)) {
        setForgotPasswordError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in forgotPasswordSubmit:`,
          error,
        )
        setForgotPasswordError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout
        backButtonHidden={forgotPasswordStatus === ForgotPasswordStatus.NEW_PASSWORD_SUCCESS}
      >
        <AccountContainer>
          {forgotPasswordStatus === ForgotPasswordStatus.NEW_PASSWORD_REQUIRED ? (
            <NewPasswordForm
              onSubmit={(verificationCode, newPassword) =>
                forgotPasswordSubmit(verificationCode, newPassword)
              }
              onResend={() => forgotPassword(lastEmail)}
              error={forgotPasswordError}
              lastEmail={lastEmail}
            />
          ) : forgotPasswordStatus === ForgotPasswordStatus.INIT ? (
            <ForgottenPasswordForm
              onSubmit={(email: string) => forgotPassword(email)}
              error={forgotPasswordError}
              lastEmail={lastEmail}
              setLastEmail={setLastEmail}
            />
          ) : (
            <AccountSuccessAlert
              title={t('forgotten_password_success_title')}
              confirmLabel={t('account_continue_link')}
              onConfirm={onConfirm}
            />
          )}
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default ServerSideAuthProviderHOC(ForgottenPasswordPage)
