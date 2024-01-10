import { Auth } from 'aws-amplify'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountSuccessAlert from 'components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import MigrationForm from 'components/forms/segments/MigrationForm/MigrationForm'
import NewPasswordForm from 'components/forms/segments/NewPasswordForm/NewPasswordForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import {
  ErrorWithCode,
  GENERIC_ERROR_MESSAGE,
  isError,
  isErrorWithCode,
} from 'frontend/utils/errors'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'

import { ROUTES } from '../frontend/api/constants'
import logger from '../frontend/utils/logger'

enum ActivateAccountStatus {
  INIT = 'INIT',
  NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
  NEW_PASSWORD_SUCCESS = 'NEW_PASSWORD_SUCCESS',
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const MigrationPage = () => {
  const [lastEmail, setLastEmail] = useState('')
  const [activateAccountError, setActivateAccountError] = useState<Error | null>(null)
  const [activateAccountStatus, setActivateAccountStatus] = useState<ActivateAccountStatus>(
    ActivateAccountStatus.INIT,
  )
  const { t } = useTranslation('account')
  const router = useRouter()

  const onConfirm = async () => {
    await router.push(ROUTES.HOME).catch((error) => logger.error('Failed redirect', error))
  }

  const forgotPassword = async () => {
    try {
      await Auth.forgotPassword(lastEmail)
      setActivateAccountStatus(ActivateAccountStatus.NEW_PASSWORD_REQUIRED)
    } catch (error) {
      logger.error('Failed forgotPassword in account migration', error)
      if (isErrorWithCode(error)) {
        if (error?.code === 'UserNotFoundException') {
          setActivateAccountError(
            new ErrorWithCode(error.message, 'MigrationUserNotFoundException'),
          )
        } else {
          setActivateAccountError(error)
        }
      } else if (isError(error)) {
        setActivateAccountError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in forgotPassword:`,
          error,
        )
        setActivateAccountError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const forgotPasswordSubmit = async (verificationCode: string, newPassword: string) => {
    try {
      await Auth.forgotPasswordSubmit(lastEmail, verificationCode, newPassword)
      setActivateAccountStatus(ActivateAccountStatus.NEW_PASSWORD_SUCCESS)
    } catch (error) {
      if (isError(error)) {
        setActivateAccountError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in forgotPasswordSubmit:`,
          error,
        )
        setActivateAccountError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  return (
    <LoginRegisterLayout backButtonHidden>
      <AccountContainer>
        {activateAccountStatus === ActivateAccountStatus.NEW_PASSWORD_REQUIRED ? (
          <NewPasswordForm
            onSubmit={(verificationCode, newPassword) =>
              forgotPasswordSubmit(verificationCode, newPassword)
            }
            onResend={forgotPassword}
            error={activateAccountError}
            lastEmail={lastEmail}
            fromMigration
          />
        ) : activateAccountStatus === ActivateAccountStatus.INIT ? (
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
  )
}

export default ServerSideAuthProviderHOC(MigrationPage)
