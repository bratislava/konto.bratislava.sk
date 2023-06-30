import { Auth } from 'aws-amplify'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import ForgottenPasswordForm from 'components/forms/segments/ForgottenPasswordForm/ForgottenPasswordForm'
import NewPasswordForm from 'components/forms/segments/NewPasswordForm/NewPasswordForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { getSSRCurrentAuth } from 'components/logic/ServerSideAuthProvider'
import { AccountError } from 'frontend/dtos/accountDto'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import { ROUTES } from '../frontend/api/constants'
import { isProductionDeployment } from '../frontend/utils/general'
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
      isProductionDeploy: isProductionDeployment(),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const ForgottenPasswordPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const [lastEmail, setLastEmail] = useState('')
  const [forgotPasswordError, setForgotPasswordError] = useState<AccountError | null>(null)
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<ForgotPasswordStatus>(
    ForgotPasswordStatus.INIT,
  )
  const { t } = useTranslation('account')
  const router = useRouter()

  const onConfirm = async () => {
    await router.push(ROUTES.HOME).catch((error) => logger.error('Failed redirect', error))
  }

  const forgotPassword = async () => {
    try {
      await Auth.forgotPassword(lastEmail)
      setForgotPasswordStatus(ForgotPasswordStatus.NEW_PASSWORD_REQUIRED)
    } catch (error) {
      logger.error('Failed forgotPassword', error)
      setForgotPasswordError({ code: error?.code, message: error?.message })
    }
  }

  const forgotPasswordSubmit = async (verificationCode: string, newPassword: string) => {
    try {
      await Auth.forgotPasswordSubmit(lastEmail, verificationCode, newPassword)
      setForgotPasswordStatus(ForgotPasswordStatus.NEW_PASSWORD_SUCCESS)
    } catch (error) {
      logger.error('Failed forgotPasswordSubmit', error)
      setForgotPasswordError({ code: error?.code, message: error?.message })
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
              onResend={forgotPassword}
              error={forgotPasswordError}
              lastEmail={lastEmail}
            />
          ) : forgotPasswordStatus === ForgotPasswordStatus.INIT ? (
            <ForgottenPasswordForm
              onSubmit={forgotPassword}
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

export default ForgottenPasswordPage
