import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import MigrationForm from 'components/forms/segments/MigrationForm/MigrationForm'
import NewPasswordForm from 'components/forms/segments/NewPasswordForm/NewPasswordForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageWrapper from '../components/layouts/PageWrapper'
import { ROUTES } from '../frontend/api/constants'
import useAccount, { AccountStatus } from '../frontend/hooks/useAccount'
import logger from '../frontend/utils/logger'
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
      ...(await serverSideTranslations(locale)),
    },
  }
}

const MigrationPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { confirmPassword, forgotPassword, error, status, setStatus, lastEmail } = useAccount()
  const { t } = useTranslation('account')
  const router = useRouter()

  const onConfirm = async () => {
    // we know all of the accounts from previous year are verified
    setStatus(AccountStatus.IdentityVerificationSuccess)
    await router.push(ROUTES.HOME).catch((error_) => logger.error('Redirect failed', error_))
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden>
        <AccountContainer>
          {status === AccountStatus.NewPasswordRequired ? (
            <NewPasswordForm
              onSubmit={confirmPassword}
              onResend={forgotPassword}
              error={error}
              lastEmail={lastEmail}
              fromMigration
            />
          ) : status === AccountStatus.Idle ? (
            <MigrationForm
              onSubmit={(email: string) => forgotPassword(email, true)}
              lastEmail={lastEmail}
              error={error}
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
