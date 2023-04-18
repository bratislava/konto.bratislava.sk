import { ROUTES } from '@utils/constants'
import logger from '@utils/logger'
import { AsyncServerProps } from '@utils/types'
import useAccount, { AccountStatus } from '@utils/useAccount'
import { isProductionDeployment } from '@utils/utils'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import PasswordChangeForm from 'components/forms/segments/PasswordChangeForm/PasswordChangeForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect } from 'react'

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

const PasswordChangePage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { changePassword, error, status, isAuth } = useAccount()
  const { t } = useTranslation('account')
  const router = useRouter()
  useEffect(() => {
    if (!isAuth) {
      router.push(ROUTES.LOGIN).catch((error_) => logger.error('Failed redirect', error_))
    }
  }, [isAuth])

  const onConfirm = async () => {
    await router.push(ROUTES.HOME).catch((error_) => logger.error('Failed redirect', error_))
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout backButtonHidden={status === AccountStatus.NewPasswordSuccess}>
        <AccountContainer>
          {status === AccountStatus.NewPasswordSuccess ? (
            <AccountSuccessAlert
              title={t('password_change_success_title')}
              confirmLabel={t('account_continue_link')}
              onConfirm={onConfirm}
            />
          ) : (
            <PasswordChangeForm onSubmit={changePassword} error={error} />
          )}
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default PasswordChangePage
