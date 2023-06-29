import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import MigrationForm from 'components/forms/segments/MigrationForm/MigrationForm'
import NewPasswordForm from 'components/forms/segments/NewPasswordForm/NewPasswordForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { AccountError, AccountStatus, getSSRCurrentAuth } from 'frontend/utils/amplify'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageWrapper from '../components/layouts/PageWrapper'
import { ROUTES } from '../frontend/api/constants'
import { isProductionDeployment } from '../frontend/utils/general'
import logger from '../frontend/utils/logger'
import { AsyncServerProps } from '../frontend/utils/types'
import { useState } from 'react'
import { Auth } from 'aws-amplify'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      auth: await getSSRCurrentAuth(ctx.req),
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

const MigrationPage = ({ page, auth }: AsyncServerProps<typeof getServerSideProps>) => {
  const [lastEmail, setLastEmail] = useState('')
  const [activateAccountError, setActivateAccountError] = useState<AccountError | null>(null)
  const [activateAccountStatus, setActivateAccountStatus] = useState<AccountStatus>(
    AccountStatus.Idle,
  )
  const { t } = useTranslation('account')
  const router = useRouter()

  const onConfirm = async () => {
    await router.push(ROUTES.HOME).catch((error) => logger.error('Failed redirect', error))
  }

  const forgotPassword = async () => {
    try {
      await Auth.forgotPassword(lastEmail)
      setActivateAccountStatus(AccountStatus.NewPasswordRequired)
    } catch (error) {
      logger.error('Failed forgotPassword in account migration', error)
      if (error?.code === 'UserNotFoundException') {
        setActivateAccountError({
          code: 'MigrationUserNotFoundException',
          message: 'MigrationUserNotFoundException',
        })
      } else {
        setActivateAccountError({ code: error?.code, message: error?.message })
      }
    }
  }

  const forgotPasswordSubmit = async (verificationCode: string, newPassword: string) => {
    try {
      await Auth.forgotPasswordSubmit(lastEmail, verificationCode, newPassword)
      setActivateAccountStatus(AccountStatus.NewPasswordSuccess)
    } catch (error) {
      logger.error('Failed forgotPasswordSubmit', error)
      setActivateAccountError({ code: error?.code, message: error?.message })
    }
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations} auth={auth}>
      <LoginRegisterLayout backButtonHidden>
        <AccountContainer>
          {activateAccountStatus === AccountStatus.NewPasswordRequired ? (
            <NewPasswordForm
              onSubmit={(verificationCode, newPassword) =>
                forgotPasswordSubmit(verificationCode, newPassword)
              }
              onResend={forgotPassword}
              error={activateAccountError}
              lastEmail={lastEmail}
              fromMigration
            />
          ) : activateAccountStatus === AccountStatus.Idle ? (
            <MigrationForm
              onSubmit={forgotPassword}
              lastEmail={lastEmail}
              setLastEmail={setLastEmail}
              error={activateAccountError}
            />
          ) : (
            <AccountSuccessAlert
              title={t('migration_success_title')}
              confirmLabel={t('account_continue_link')}
              onConfirm={onConfirm}
            />
          )}
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default MigrationPage
