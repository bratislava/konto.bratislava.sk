import { resendSignUpCode, signIn } from 'aws-amplify/auth'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import LoginForm from 'components/forms/segments/LoginForm/LoginForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { ROUTES } from '../frontend/api/constants'
import { useQueryParamRedirect } from '../frontend/hooks/useQueryParamRedirect'
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

  const onLogin = async (email: string, password: string) => {
    try {
      const { nextStep, isSignedIn } = await signIn({ username: email, password })
      if (isSignedIn) {
        await redirect()
        return
      }
      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        // In case of user didn't confirm the code in the registration process, we want to redirect him/her to the
        // registration page in the state as they would be activating their account. For simplicity, we request the code
        // here.
        await resendSignUpCode({ username: email })
        const redirectQueryParams = getRedirectQueryParams()

        await router.push(
          {
            pathname: ROUTES.REGISTER,
            query: { ...redirectQueryParams, [loginConfirmSignUpEmailHiddenQueryParam]: email },
          },
          // This hides the param from the URL, but it's still accessible in the query object.
          getRouteWithRedirect(ROUTES.REGISTER),
        )
      } else {
        throw new Error('Unknown error')
      }
    } catch (error) {
      if (isError(error)) {
        setLoginError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in onLogin for email ${email}, user agent ${window.navigator.userAgent}:`,
          error,
        )
        setLoginError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  return (
    <LoginRegisterLayout backButtonHidden>
      <AccountContainer className="mb-0 pt-0 md:mb-8 md:pt-6">
        <LoginForm onSubmit={onLogin} error={loginError} />
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

export default SsrAuthProviderHOC(LoginPage)
