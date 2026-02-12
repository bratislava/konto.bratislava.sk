import { ParsedUrlQuery } from 'node:querystring'

import { AuthError, autoSignIn, confirmSignUp, resendSignUpCode, signUp } from 'aws-amplify/auth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { UpsertUserRecordClientRequestDtoLoginClientEnum } from 'openapi-clients/city-account'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cityAccountClient, LoginClientEnum } from '@/clients/city-account'
import EmailVerificationForm from '@/components/forms/auth-forms/EmailVerificationForm'
import RegisterForm from '@/components/forms/auth-forms/RegisterForm'
import HorizontalDivider from '@/components/forms/HorizontalDivider'
import AccountActivator from '@/components/forms/segments/AccountActivator/AccountActivator'
import AccountContainer from '@/components/forms/segments/AccountContainer/AccountContainer'
import AccountLink from '@/components/forms/segments/AccountLink/AccountLink'
import AccountSuccessAlert from '@/components/forms/segments/AccountSuccessAlert/AccountSuccessAlert'
import PageLayout from '@/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/components/logic/SsrAuthContext'
import { ROUTES } from '@/frontend/api/constants'
import { UserAttributes } from '@/frontend/dtos/accountDto'
import { useQueryParamRedirect } from '@/frontend/hooks/useQueryParamRedirect'
import { amplifyGetServerSideProps } from '@/frontend/utils/amplifyServer'
import { GENERIC_ERROR_MESSAGE, isError } from '@/frontend/utils/errors'
import { fetchClientInfo } from '@/frontend/utils/fetchClientInfo'
import logger from '@/frontend/utils/logger'
import { SafeRedirectType } from '@/frontend/utils/queryParamRedirect'
import { slovakServerSideTranslations } from '@/frontend/utils/slovakServerSideTranslations'
import {
  AmplifyClientOAuthProvider,
  useOAuthGetContext,
} from '@/frontend/utils/useAmplifyClientOAuthContext'
import { usePrepareFormMigration } from '@/frontend/utils/usePrepareFormMigration'
import { AuthPageCommonProps, loginConfirmSignUpEmailHiddenQueryParam } from '@/pages/prihlasenie'

enum RegistrationStatus {
  INIT = 'INIT',
  EMAIL_VERIFICATION_REQUIRED = 'EMAIL_VERIFICATION_REQUIRED',
  SUCCESS_AUTO_SIGN_IN = 'SUCCESS_AUTO_SIGN_IN',
  /**
   * In case if the email verification is not triggered by `signUp` with `autoSignIn: true`, but by being redirected
   * from login page, it is not possible to use auto sign in, so user has to manually sign in afterward.
   */
  SUCCESS_MANUAL_SIGN_IN = 'SUCCESS_MANUAL_SIGN_IN',
}

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context }) => {
    const clientInfo = await fetchClientInfo(context.query)

    return {
      props: {
        clientInfo,
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignOut: true, redirectQueryParam: true },
)

/**
 * In a race condition, it is possible that the user is already confirmed, but user can still ask for confirmation.
 * In this case, we want to proceed to manual sign in. Also, the displayed error is confusing to the user.
 * It is not possible to distinguish this case from other cases of NotAuthorizedException/InvalidParameterException, so
 * we have to check the error message.
 */
const isSpecialAlreadyConfirmedError = (error: unknown) => {
  if (!(error instanceof AuthError)) {
    return false
  }

  const isNotAuthorizedException =
    error.name === 'NotAuthorizedException' &&
    error.message === 'User cannot be confirmed. Current status is CONFIRMED'
  const isInvalidParameterException =
    error.name === 'InvalidParameterException' && error.message === 'User is already confirmed.'

  return isNotAuthorizedException || isInvalidParameterException
}

const getInitialState = (query: ParsedUrlQuery) => {
  const email = query[loginConfirmSignUpEmailHiddenQueryParam]
  // In case user wanted to log in, but needs to verify email, he/she is redirected to registration page with email in query
  // to act as if he/she was registering.
  if (email && typeof email === 'string') {
    return { registrationStatus: RegistrationStatus.EMAIL_VERIFICATION_REQUIRED, lastEmail: email }
  }

  return { registrationStatus: RegistrationStatus.INIT, lastEmail: '' }
}

const RegisterPage = ({ clientInfo }: AuthPageCommonProps) => {
  const router = useRouter()
  const { safeRedirect, getRouteWithRedirect, redirect } = useQueryParamRedirect()
  const { prepareFormMigration } = usePrepareFormMigration('sign-up')

  const { isOAuthLogin, storeTokensAndRedirect, clientTitle, isIdentityVerificationRequired } =
    useOAuthGetContext(clientInfo)

  const { t } = useTranslation('account')
  const [initialState] = useState(getInitialState(router.query))
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(
    initialState.registrationStatus,
  )
  const [registrationError, setRegistrationError] = useState<Error | null>(null)
  const [lastEmail, setLastEmail] = useState<string>(initialState.lastEmail)

  useEffect(() => {
    if (initialState.registrationStatus === RegistrationStatus.EMAIL_VERIFICATION_REQUIRED) {
      logger.info(
        `[AUTH] User redirected to registration page to verify email for email ${initialState.lastEmail}`,
      )
    }
  }, [initialState])

  const accountContainerRef = useRef<HTMLDivElement>(null)

  const handleErrorChange = (error: Error | null) => {
    setRegistrationError(error)

    if (error) {
      accountContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleAutoSignIn = async () => {
    try {
      logger.info(`[AUTH] Attempting to complete auto sign in for email ${lastEmail}`)
      const { isSignedIn, nextStep } = await autoSignIn()
      if (isSignedIn) {
        logger.info(`[AUTH] Successfully completed auto sign in for email ${lastEmail}`)

        await prepareFormMigration()

        // This endpoint must be called to register user also to the City Account BE
        await cityAccountClient.userControllerUpsertUserAndRecordClient(
          {
            loginClient:
              (clientInfo?.clientName as UpsertUserRecordClientRequestDtoLoginClientEnum) ??
              LoginClientEnum.CityAccount,
          },
          { authStrategy: 'authOnly' },
        )
        setRegistrationStatus(RegistrationStatus.SUCCESS_AUTO_SIGN_IN)
      } else {
        throw new Error(
          `Unknown "nextStep" after trying to complete auto sign in: ${JSON.stringify(nextStep)}`,
        )
      }
    } catch (error) {
      logger.error(`[AUTH] Failed to complete auto sign in for email ${lastEmail}`, error)
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const handleSignUp = async (
    email: string,
    password: string,
    turnstileToken: string,
    data: UserAttributes,
  ) => {
    try {
      logger.info(`[AUTH] Attempting to sign up for email ${email}`)
      handleErrorChange(null)
      setLastEmail(email)
      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: data,
          autoSignIn: true,
          validationData: {
            'custom:turnstile_token': turnstileToken,
          },
        },
      })
      // eslint-disable-next-line unicorn/prefer-switch
      if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        logger.info(`[AUTH] Completing auto sign in after successful sing up for email ${email}`)
        await handleAutoSignIn()
      } else if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        logger.info(`[AUTH] Requesting sign-up code for email ${email}`)
        setRegistrationStatus(RegistrationStatus.EMAIL_VERIFICATION_REQUIRED)
      } else if (nextStep.signUpStep === 'DONE') {
        logger.info(
          `[AUTH] Successfully signed up for email ${email}, proceeding to manual sign in`,
        )
        await prepareFormMigration()

        setRegistrationStatus(RegistrationStatus.SUCCESS_MANUAL_SIGN_IN)
      } else {
        throw new Error(`Unknown "nextStep" after trying to sign up: ${JSON.stringify(nextStep)}`)
      }
    } catch (error) {
      logger.error(`[AUTH] Failed to sign up for email ${email}`, error)
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const resendVerificationCode = async () => {
    try {
      logger.info(`[AUTH] Resending verification code for email ${lastEmail}`)
      handleErrorChange(null)
      await resendSignUpCode({ username: lastEmail })
      logger.info(`[AUTH] Successfully resent verification code for email ${lastEmail}`)
    } catch (error) {
      logger.error(`[AUTH] Failed to resend verification code for email ${lastEmail}`, error)

      if (isSpecialAlreadyConfirmedError(error)) {
        logger.info(
          `[AUTH] Email for email ${lastEmail} is already verified, proceeding to manual sign in`,
        )
        handleErrorChange(null)
        setRegistrationStatus(RegistrationStatus.SUCCESS_MANUAL_SIGN_IN)
        return
      }

      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const verifyEmail = async (confirmationCode: string) => {
    try {
      logger.info(`[AUTH] Attempting to verify email for email ${lastEmail}`)
      handleErrorChange(null)
      const { nextStep } = await confirmSignUp({
        username: lastEmail,
        confirmationCode,
      })
      if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        logger.info(
          `[AUTH] Completing auto sign in after successful email verification for email ${lastEmail}`,
        )
        await handleAutoSignIn()
      } else if (nextStep.signUpStep === 'DONE') {
        logger.info(
          `[AUTH] Successfully verified email for email ${lastEmail}, proceeding to manual sign in`,
        )
        setRegistrationStatus(RegistrationStatus.SUCCESS_MANUAL_SIGN_IN)
      } else {
        throw new Error(
          `Unknown "nextStep" after trying to verify email: ${JSON.stringify(nextStep)}`,
        )
      }
    } catch (error) {
      logger.error(`[AUTH] Failed to verify email for email ${lastEmail}`, error)

      if (isSpecialAlreadyConfirmedError(error)) {
        logger.info(
          `[AUTH] Email for email ${lastEmail} is already verified, proceeding to manual sign in`,
        )
        handleErrorChange(null)
        setRegistrationStatus(RegistrationStatus.SUCCESS_MANUAL_SIGN_IN)
        return
      }
      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const accountSuccessAlertProps = useMemo(() => {
    if (registrationStatus === RegistrationStatus.SUCCESS_MANUAL_SIGN_IN) {
      return {
        confirmLabel: t('auth.register_success_go_to_login'),
        onConfirm: () => {
          router
            .push(getRouteWithRedirect(ROUTES.LOGIN))
            .catch(() => logger.error(`${GENERIC_ERROR_MESSAGE} redirect failed`))
        },
      }
    }

    // eslint-disable-next-line security/detect-non-literal-regexp
    const municipalServiceRegex = new RegExp(`^${ROUTES.MUNICIPAL_SERVICES}/.+$`)

    // We are only allowed legally to redirect to identity verification from forms
    const redirectToIdentityVerification =
      safeRedirect.type === SafeRedirectType.Local && municipalServiceRegex.test(safeRedirect.url)

    if (redirectToIdentityVerification) {
      return {
        confirmLabel: t('auth.continue_to_account'),
        onConfirm: () =>
          router
            .push(getRouteWithRedirect(ROUTES.IDENTITY_VERIFICATION))
            .catch(() => logger.error(`${GENERIC_ERROR_MESSAGE} redirect failed`)),
        cancelLabel: t('auth.identity_verification.common.skip_verification_button_text'),
        onCancel: () => redirect(),
      }
    }

    if (isOAuthLogin) {
      if (isIdentityVerificationRequired) {
        return {
          description: `${t('auth.register_success_description', { email: lastEmail })}\n\n${t('auth.oauth_page.identity_verification_is_required_info')}`,
          confirmLabel: t('auth.oauth_page.continue_to_identity_verification'),
          onConfirm: () => {
            router
              .push(getRouteWithRedirect(ROUTES.IDENTITY_VERIFICATION))
              .catch(() => logger.error(`${GENERIC_ERROR_MESSAGE} redirect failed`))
          },
        }
      }

      return {
        confirmLabel: t('auth.oauth_page.continue_to_oauth_origin', { clientTitle }),
        onConfirm: () => {
          storeTokensAndRedirect()
        },
      }
    }

    return {
      confirmLabel: t('auth.continue_to_account'),
      onConfirm: () => {
        redirect()
      },
    }
  }, [
    clientTitle,
    getRouteWithRedirect,
    isIdentityVerificationRequired,
    isOAuthLogin,
    lastEmail,
    redirect,
    storeTokensAndRedirect,
    registrationStatus,
    router,
    safeRedirect.type,
    safeRedirect.url,
    t,
  ])

  return (
    <AmplifyClientOAuthProvider clientInfo={clientInfo}>
      <PageLayout variant="auth" hideBackButton>
        {registrationStatus === RegistrationStatus.INIT && <AccountActivator />}

        <AccountContainer
          dataCyPrefix="registration"
          ref={accountContainerRef}
          className="flex flex-col gap-8 md:gap-10"
        >
          {registrationStatus === RegistrationStatus.INIT && (
            <>
              <RegisterForm
                lastEmail={lastEmail}
                onSubmit={handleSignUp}
                error={registrationError}
              />
              <HorizontalDivider />
              <AccountLink variant="login" />
            </>
          )}
          {registrationStatus === RegistrationStatus.EMAIL_VERIFICATION_REQUIRED && (
            <EmailVerificationForm
              lastEmail={lastEmail}
              onResend={resendVerificationCode}
              onSubmit={verifyEmail}
              error={registrationError}
            />
          )}
          {(registrationStatus === RegistrationStatus.SUCCESS_AUTO_SIGN_IN ||
            registrationStatus === RegistrationStatus.SUCCESS_MANUAL_SIGN_IN) && (
            <AccountSuccessAlert
              title={t('auth.register_success_title')}
              description={t('auth.register_success_description', { email: lastEmail })}
              {...accountSuccessAlertProps}
            />
          )}
        </AccountContainer>
      </PageLayout>
    </AmplifyClientOAuthProvider>
  )
}

export default SsrAuthProviderHOC(RegisterPage)
