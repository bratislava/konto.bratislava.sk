import {
  AuthError,
  confirmUserAttribute,
  sendUserAttributeVerificationCode,
  updatePassword,
  updateUserAttributes,
} from 'aws-amplify/auth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useRef, useState } from 'react'

import { cityAccountClient } from '@/src/clients/city-account'
import { strapiClient } from '@/src/clients/graphql-strapi'
import EmailChangeForm from '@/src/components/auth-forms/EmailChangeForm'
import EmailVerificationForm from '@/src/components/auth-forms/EmailVerificationForm'
import AccountContainer from '@/src/components/layouts/AccountContainer'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import AccountSuccessAlert from '@/src/components/segments/AccountSuccessAlert/AccountSuccessAlert'
import { AmplifyClientOAuthProvider } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { ErrorWithName, GENERIC_ERROR_MESSAGE, isError } from '@/src/frontend/utils/errors'
import { fetchClientInfo } from '@/src/frontend/utils/fetchClientInfo'
import logger from '@/src/frontend/utils/logger'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'
import { AuthPageCommonProps } from '@/src/pages/prihlasenie'
import { ROUTES } from '@/src/utils/routes'

enum EmailChangeStatus {
  INIT = 'INIT',
  EMAIL_VERIFICATION_REQUIRED = 'EMAIL_VERIFICATION_REQUIRED',
  EMAIL_VERIFICATION_SUCCESS = 'EMAIL_VERIFICATION_SUCCESS',
}

/**
 * This seems to be the only way how to check if password is correct. In Amplify v5 it was possible to trigger sign in,
 * but in v6 it's not possible to sign in multiple times anymore.
 */
const verifyPassword = async (password: string) => {
  try {
    await updatePassword({
      oldPassword: password,
      newPassword: password,
    })
  } catch (error) {
    if (error instanceof AuthError && error.name === 'NotAuthorizedException') {
      throw new ErrorWithName('Incorrect password', 'IncorrectPasswordException')
    }
    throw error
  }
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

const EmailChangePage = ({ general, clientInfo }: AuthPageCommonProps) => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const { userAttributes } = useSsrAuth()
  const [emailChangeStatus, setEmailChangeStatus] = useState<EmailChangeStatus>(
    EmailChangeStatus.INIT,
  )
  const [lastEmail, setLastEmail] = useState<string>('')
  const [emailChangeError, setEmailChangeError] = useState<Error | null>(null)

  const accountContainerRef = useRef<HTMLDivElement>(null)

  const handleErrorChange = (error: Error | null) => {
    setEmailChangeError(error)

    if (error) {
      accountContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const resendVerificationCode = async () => {
    try {
      logger.info(`[AUTH] Resending email verification code for email ${userAttributes?.email}`)
      handleErrorChange(null)
      await sendUserAttributeVerificationCode({
        userAttributeKey: 'email',
      })
      logger.info(
        `[AUTH] Successfully resent email verification code for email ${userAttributes?.email}`,
      )
    } catch (error) {
      logger.error(
        `[AUTH] Failed to resend email verification code for email ${userAttributes?.email}`,
        error,
      )
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const verifyEmail = async (confirmationCode: string) => {
    try {
      logger.info(
        `[AUTH] Attempting to verify new email ${lastEmail} for email ${userAttributes?.email}`,
      )
      handleErrorChange(null)
      await confirmUserAttribute({
        userAttributeKey: 'email',
        confirmationCode,
      })
      await cityAccountClient.userControllerChangeEmail(
        { newEmail: lastEmail },
        { authStrategy: 'authOnly' },
      )
      logger.info(
        `[AUTH] Successfully verified new email ${lastEmail} for email ${userAttributes?.email}`,
      )
      setEmailChangeStatus(EmailChangeStatus.EMAIL_VERIFICATION_SUCCESS)
    } catch (error) {
      logger.error(
        `[AUTH] Failed to verify new email ${lastEmail} for email ${userAttributes?.email}`,
        error,
      )
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const changeEmail = async (newEmail: string, password: string) => {
    try {
      logger.info(
        `[AUTH] Attempting to change email to ${newEmail} for email ${userAttributes?.email}`,
      )
      handleErrorChange(null)
      setLastEmail(newEmail)
      await verifyPassword(password)
      logger.info(`[AUTH] Successfully verified password for email ${userAttributes?.email}`)
      const result = await updateUserAttributes({
        userAttributes: { email: newEmail },
      })
      // In E2E tests, confirmation with code is disabled, so the attribute is updated immediately
      if (result.email?.nextStep.updateAttributeStep === 'DONE') {
        await cityAccountClient.userControllerChangeEmail(
          { newEmail },
          { authStrategy: 'authOnly' },
        )
        logger.info(
          `[AUTH] Successfully changed email to ${newEmail} for email ${userAttributes?.email}`,
        )
        setEmailChangeStatus(EmailChangeStatus.EMAIL_VERIFICATION_SUCCESS)
      } else if (result.email?.nextStep.updateAttributeStep === 'CONFIRM_ATTRIBUTE_WITH_CODE') {
        logger.info(
          `[AUTH] Requesting email verification code after email change to ${newEmail} for email ${userAttributes?.email}`,
        )
        setEmailChangeStatus(EmailChangeStatus.EMAIL_VERIFICATION_REQUIRED)
      } else {
        throw new Error(
          `Unknown "nextStep" after trying to change email: ${JSON.stringify(
            result.email?.nextStep,
          )}`,
        )
      }
    } catch (error) {
      logger.error(
        `[AUTH] Failed to change email to ${newEmail} for email ${userAttributes?.email}`,
        error,
      )
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const onConfirm = async () => {
    await router.push(ROUTES.HOME).catch((error_) => logger.error('Failed redirect', error_))
  }

  return (
    <AmplifyClientOAuthProvider clientInfo={clientInfo}>
      <GeneralContextProvider general={general}>
        <PageLayout
          variant="auth"
          hideBackButton={emailChangeStatus === EmailChangeStatus.EMAIL_VERIFICATION_SUCCESS}
        >
          <AccountContainer ref={accountContainerRef}>
            {emailChangeStatus === EmailChangeStatus.INIT ? (
              <EmailChangeForm onSubmit={changeEmail} error={emailChangeError} />
            ) : emailChangeStatus === EmailChangeStatus.EMAIL_VERIFICATION_REQUIRED ? (
              <EmailVerificationForm
                lastEmail={lastEmail}
                onResend={resendVerificationCode}
                onSubmit={verifyEmail}
                error={emailChangeError}
              />
            ) : (
              <AccountSuccessAlert
                title={t('auth.email_change_success_title')}
                confirmLabel={t('auth.continue_to_account')}
                onConfirm={onConfirm}
                description={t('auth.email_change_success_description', { email: lastEmail })}
              />
            )}
          </AccountContainer>
        </PageLayout>
      </GeneralContextProvider>
    </AmplifyClientOAuthProvider>
  )
}

export default SsrAuthProviderHOC(EmailChangePage)
