import { cityAccountClient } from '@clients/city-account'
import { AuthError, getCurrentUser, resendSignUpCode, signIn } from 'aws-amplify/auth'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import LoginForm from 'components/forms/segments/LoginForm/LoginForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { usePrepareFormMigration } from 'frontend/utils/usePrepareFormMigration'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { ROUTES } from '../frontend/api/constants'
import { useQueryParamRedirect } from '../frontend/hooks/useQueryParamRedirect'
import {
  removeAllCookiesAndClearLocalStorage,
  removeAmplifyGuestIdentityIdCookies,
} from '../frontend/utils/amplifyClient'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(
  async () => {
    return {
      props: {
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignOut: true, redirectQueryParam: true },
)

export const loginConfirmSignUpEmailHiddenQueryParam = `loginConfirmSignUpEmail`

const LoginPage = () => {
  const router = useRouter()
  const { redirect, getRouteWithRedirect, getRedirectQueryParams } = useQueryParamRedirect()
  const [loginError, setLoginError] = useState<Error | null>(null)
  const accountContainerRef = useRef<HTMLDivElement>(null)
  const { prepareFormMigration } = usePrepareFormMigration('sign-in')

  const handleErrorChange = (error: Error | null) => {
    setLoginError(error)

    if (error) {
      accountContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const onLogin = async (email: string, password: string) => {
    logger.info(`[AUTH] Attempting to sign in for email ${email}`)
    try {
      const { nextStep, isSignedIn } = await signIn({ username: email, password })
      if (isSignedIn) {
        logger.info(`[AUTH] Successfully signed in for email ${email}`)
        // Temporary fix for: https://github.com/aws-amplify/amplify-js/issues/14378
        removeAmplifyGuestIdentityIdCookies()
        await prepareFormMigration()
        // In order to ensure every user is in City Account BE database it's good to do this on each successful sign-in,
        // there might be some cases where user is not there yet.
        await cityAccountClient.userControllerGetOrCreateUser({ authStrategy: 'authOnly' })
        await redirect()
        return
      }
      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        // In case of user didn't confirm the code in the registration process, we want to redirect him/her to the
        // registration page in the state as they would be activating their account. For simplicity, we request the code
        // here.
        logger.info(
          `[AUTH] User didn't confirm the code in the registration process, requesting sign-up code for email ${email}`,
        )
        await resendSignUpCode({ username: email })
        const redirectQueryParams = getRedirectQueryParams()

        logger.info(
          `[AUTH] Redirecting to registration page for sign up confirmation for email ${email}`,
        )
        await router.push(
          {
            pathname: ROUTES.REGISTER,
            query: { ...redirectQueryParams, [loginConfirmSignUpEmailHiddenQueryParam]: email },
          },
          // This hides the param from the URL, but it's still accessible in the query object.
          getRouteWithRedirect(ROUTES.REGISTER),
        )
      } else {
        throw new Error(`Unknown "nextStep" after trying to sign in: ${JSON.stringify(nextStep)}`)
      }
    } catch (error) {
      logger.error(`[AUTH] Failed to sign in for email ${email}`, error)
      if (error instanceof AuthError && error.name === 'UnexpectedSignInInterruptionException') {
        removeAllCookiesAndClearLocalStorage()
        logger.info(`[AUTH] Removed all cookies and cleared local storage for email ${email}`)
      }

      // Handles a bug in Amplify after update. Server context doesn't detect users signed in in previous versions of
      // the library. The client does, and in attempt to sign in it throws this error.
      if (error instanceof AuthError && error.name === 'UserAlreadyAuthenticatedException') {
        const currentUser = await getCurrentUser()
        if (currentUser.signInDetails?.loginId === email) {
          logger.info(`[AUTH] Special case, user already authenticated for email ${email}`)
          await redirect()
          return
        }
        logger.error(
          `[AUTH] Special case, user already authenticated, but not for email ${email}, signed in as ${currentUser.signInDetails?.loginId}.`,
        )
      }

      if (isError(error)) {
        handleErrorChange(error)
      } else {
        handleErrorChange(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  return (
    <LoginRegisterLayout backButtonHidden>
      <AccountContainer className="mb-0 md:mb-8 md:pt-6" ref={accountContainerRef}>
        <LoginForm onSubmit={onLogin} error={loginError} />
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

export default SsrAuthProviderHOC(LoginPage)
