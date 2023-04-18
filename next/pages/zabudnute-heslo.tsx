import { ROUTES } from '@utils/constants'
import logger from '@utils/logger'
import { AsyncServerProps } from '@utils/types'
import useAccount, { AccountStatus } from '@utils/useAccount'
import { isProductionDeployment } from '@utils/utils'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import ForgottenPasswordForm from 'components/forms/segments/ForgottenPasswordForm/ForgottenPasswordForm'
import NewPasswordForm from 'components/forms/segments/NewPasswordForm/NewPasswordForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageWrapper from '../components/layouts/PageWrapper'

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

const ForgottenPasswordPage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { confirmPassword, forgotPassword, error, status, setStatus, lastEmail } = useAccount()
  const { t } = useTranslation('account')
  const router = useRouter()

  const onConfirm = async () => {
    setStatus(AccountStatus.Idle)
    await router.push(ROUTES.HOME).catch((error_) => logger.error('Failed redirect', error_))
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden={status === AccountStatus.NewPasswordSuccess}>
        <AccountContainer>
          {status === AccountStatus.NewPasswordRequired ? (
            <NewPasswordForm
              onSubmit={confirmPassword}
              onResend={forgotPassword}
              error={error}
              lastEmail={lastEmail}
            />
          ) : status === AccountStatus.Idle ? (
            <ForgottenPasswordForm onSubmit={forgotPassword} error={error} lastEmail={lastEmail} />
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
