import { updatePassword } from 'aws-amplify/auth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'

import { strapiClient } from '@/src/clients/graphql-strapi'
import PasswordChangeForm from '@/src/components/auth-forms/PasswordChangeForm'
import AccountContainer from '@/src/components/layouts/AccountContainer'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import AccountSuccessAlert from '@/src/components/segments/AccountSuccessAlert/AccountSuccessAlert'
import { AmplifyClientOAuthProvider } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { GENERIC_ERROR_MESSAGE, isError } from '@/src/frontend/utils/errors'
import { fetchClientInfo } from '@/src/frontend/utils/fetchClientInfo'
import logger from '@/src/frontend/utils/logger'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'
import { AuthPageCommonProps } from '@/src/pages/prihlasenie'
import { ROUTES } from '@/src/utils/routes'

enum PasswordChangeStatus {
  INIT = 'INIT',
  NEW_PASSWORD_SUCCESS = 'NEW_PASSWORD_SUCCESS',
}

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context }) => {
    const [general, clientInfo] = await Promise.all([
      strapiClient.General(),
      fetchClientInfo(context.query),
    ])

    return {
      props: {
        general,
        clientInfo,
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const PasswordChangePage = ({ general, clientInfo }: AuthPageCommonProps) => {
  const { userAttributes } = useSsrAuth()

  const { t } = useTranslation('account')
  const router = useRouter()
  const [passwordChangeError, setPasswordChangeError] = useState<Error | null>(null)
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<PasswordChangeStatus>(
    PasswordChangeStatus.INIT,
  )

  const accountContainerRef = useRef<HTMLDivElement>(null)

  const handleErrorChange = (error: Error | null) => {
    setPasswordChangeError(error)

    if (error) {
      accountContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const onConfirm = async () => {
    await router.push(ROUTES.HOME).catch((error_) => logger.error('Failed redirect', error_))
  }

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      logger.info(`[AUTH] Attempting to change password for email ${userAttributes?.email}`)
      handleErrorChange(null)
      await updatePassword({
        oldPassword,
        newPassword,
      })
      logger.info(`[AUTH] Successfully changed password for email ${userAttributes?.email}`)
      setPasswordChangeStatus(PasswordChangeStatus.NEW_PASSWORD_SUCCESS)
    } catch (error) {
      logger.error(`[AUTH] Failed to change password for email ${userAttributes?.email}`, error)
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  return (
    <AmplifyClientOAuthProvider clientInfo={clientInfo}>
      <GeneralContextProvider general={general}>
        <PageLayout
          variant="auth"
          hideBackButton={passwordChangeStatus === PasswordChangeStatus.NEW_PASSWORD_SUCCESS}
        >
          <AccountContainer ref={accountContainerRef}>
            {passwordChangeStatus === PasswordChangeStatus.NEW_PASSWORD_SUCCESS ? (
              <AccountSuccessAlert
                title={t('auth.password_change_success_title')}
                confirmLabel={t('auth.continue_to_account')}
                onConfirm={onConfirm}
              />
            ) : (
              <PasswordChangeForm onSubmit={changePassword} error={passwordChangeError} />
            )}
          </AccountContainer>
        </PageLayout>
      </GeneralContextProvider>
    </AmplifyClientOAuthProvider>
  )
}

export default SsrAuthProviderHOC(PasswordChangePage)
