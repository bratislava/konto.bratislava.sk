import { autoSignIn, confirmSignUp, resendSignUpCode, signIn } from 'aws-amplify/auth'
import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import EmailVerificationForm from 'components/forms/segments/EmailVerificationForm/EmailVerificationForm'
import LoginForm from 'components/forms/segments/LoginForm/LoginForm'
import LoginRegisterLayout from 'components/layouts/LoginRegisterLayout'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { useState } from 'react'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { useLoginRedirect } from '../frontend/hooks/useLoginRedirect'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import {
  getRedirectUrl,
  getSafeLoginRedirect,
  removeFromFromResolvedUrl,
  shouldRemoveLoginRedirectParam,
} from '../frontend/utils/safeLoginRedirect'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context, isSignedIn, getAccessToken }) => {
    const from = context.query.from as string | undefined
    const shouldRemove = shouldRemoveLoginRedirectParam(from)
    if (shouldRemove) {
      return {
        redirect: {
          destination: removeFromFromResolvedUrl(context.resolvedUrl),
          permanent: false,
        },
      }
    }

    if (isSignedIn) {
      const safeFrom = getSafeLoginRedirect(from)
      const destination = await getRedirectUrl(safeFrom, getAccessToken)
      console.log('destination', destination)

      return {
        redirect: {
          destination,
          permanent: false,
        },
      }
    }

    return {
      props: {
        ...(await slovakServerSideTranslations()),
      },
    }
  },
)

const LoginPage = () => {
  const { redirectAfterLogin } = useLoginRedirect()
  const [loginError, setLoginError] = useState<Error | null>(null)
  // if email is not yet verify login will fail - we stay on this page & render verification form for the last used email
  const [emailToVerify, setEmailToVerify] = useState('')

  const onLogin = async (email: string, password: string) => {
    try {
      const { nextStep, isSignedIn } = await signIn({ username: email, password })
      if (isSignedIn) {
        await redirectAfterLogin()
        return
      }
      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        setEmailToVerify(email)
        await resendSignUpCode({ username: email })
      } else {
        throw new Error('Unknown error')
      }
    } catch (error) {
      if (isError(error)) {
        setLoginError(error)
      } else {
        logger.error(`${GENERIC_ERROR_MESSAGE} - unexpected object thrown in onVerifyEmail:`, error)
        setLoginError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const handleAutoSignIn = async () => {
    try {
      const { isSignedIn } = await autoSignIn()
      if (isSignedIn) {
        await redirectAfterLogin()
      } else {
        throw new Error('Unknown error')
      }
    } catch (error) {
      if (isError(error)) {
        setLoginError(error)
      } else {
        logger.error(`${GENERIC_ERROR_MESSAGE} - unexpected object thrown in verifyEmail:`, error)
        setLoginError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  const verifyEmail = async (confirmationCode: string) => {
    try {
      const { nextStep } = await confirmSignUp({
        username: emailToVerify,
        confirmationCode,
      })
      if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        await handleAutoSignIn()
      } else {
        throw new Error('Unknown error')
      }
    } catch (error) {
      if (isError(error)) {
        setLoginError(error)
      } else {
        logger.error(`${GENERIC_ERROR_MESSAGE} - unexpected object thrown in verifyEmail:`, error)
        setLoginError(new Error(GENERIC_ERROR_MESSAGE))
      }
    }
  }

  return (
    <LoginRegisterLayout backButtonHidden>
      <AccountContainer className="mb-0 pt-0 md:mb-8 md:pt-6">
        {emailToVerify ? (
          <EmailVerificationForm
            onResend={() => resendSignUpCode({ username: emailToVerify })}
            onSubmit={verifyEmail}
            error={loginError}
            lastEmail={emailToVerify}
          />
        ) : (
          <LoginForm onSubmit={onLogin} error={loginError} />
        )}
      </AccountContainer>
    </LoginRegisterLayout>
  )
}

export default SsrAuthProviderHOC(LoginPage)
