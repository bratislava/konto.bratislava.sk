import { Auth } from 'aws-amplify'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import PasswordChangeForm from 'components/forms/segments/PasswordChangeForm/PasswordChangeForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { getSSRCurrentAuth } from 'components/logic/ServerSideAuthProvider'
import { AccountError } from 'frontend/dtos/accountDto'
import { useDerivedServerSideAuthState } from 'frontend/hooks/useServerSideAuth'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect, useState } from 'react'

import PageWrapper from '../components/layouts/PageWrapper'
import { ROUTES } from '../frontend/api/constants'
import { isProductionDeployment } from '../frontend/utils/general'
import logger from '../frontend/utils/logger'
import { AsyncServerProps } from '../frontend/utils/types'

enum PasswordChangeStatus {
  INIT = 'INIT',
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

const PasswordChangePage = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const { isAuthenticated } = useDerivedServerSideAuthState()
  const [passwordChangeError, setPasswordChangeError] = useState<AccountError | null>(null)
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<PasswordChangeStatus>(
    PasswordChangeStatus.INIT,
  )

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN).catch((error_) => logger.error('Failed redirect', error_))
    }
  }, [isAuthenticated, router])

  const onConfirm = async () => {
    await router.push(ROUTES.HOME).catch((error_) => logger.error('Failed redirect', error_))
  }

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setPasswordChangeError(null)
      const user = await Auth.currentAuthenticatedUser()
      await Auth.changePassword(user, oldPassword, newPassword)
      setPasswordChangeStatus(PasswordChangeStatus.NEW_PASSWORD_SUCCESS)
    } catch (error) {
      setPasswordChangeError({ code: error?.message, message: error?.message })
    }
  }

  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <LoginRegisterLayout
        backButtonHidden={passwordChangeStatus === PasswordChangeStatus.NEW_PASSWORD_SUCCESS}
      >
        <AccountContainer>
          {passwordChangeStatus === PasswordChangeStatus.NEW_PASSWORD_SUCCESS ? (
            <AccountSuccessAlert
              title={t('password_change_success_title')}
              confirmLabel={t('account_continue_link')}
              onConfirm={onConfirm}
            />
          ) : (
            <PasswordChangeForm onSubmit={changePassword} error={passwordChangeError} />
          )}
        </AccountContainer>
      </LoginRegisterLayout>
    </PageWrapper>
  )
}

export default PasswordChangePage
