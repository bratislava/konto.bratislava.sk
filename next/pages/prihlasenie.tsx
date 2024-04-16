import { AuthError, resendSignUpCode, signIn } from 'aws-amplify/auth'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import LoginForm from 'components/forms/segments/LoginForm/LoginForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { ROUTES } from '../frontend/api/constants'
import { useQueryParamRedirect } from '../frontend/hooks/useQueryParamRedirect'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

// Attempts to fix https://github.com/aws-amplify/amplify-js/issues/13182
function removeAllCookiesAndClearLocalStorage() {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim())
  cookies.forEach((cookie) => {
    const cookieName = cookie.split('=')[0]
    if (cookieName !== 'gdpr-consents') {
      // https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  })
  localStorage.clear()
}

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
