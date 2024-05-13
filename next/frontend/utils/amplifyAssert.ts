import type { CognitoAuthSignInDetails } from '@aws-amplify/auth/dist/esm/providers/cognito/types'
import type { AmplifyServer } from '@aws-amplify/core/dist/esm/adapterCore'
import { AuthError } from 'aws-amplify/auth'
import { getCurrentUser } from 'aws-amplify/auth/server'
import { GetServerSidePropsContext } from 'next/types'

const getSignInDetails = async (contextSpec: AmplifyServer.ContextSpec) => {
  try {
    const { signInDetails } = await getCurrentUser(contextSpec)
    return signInDetails
  } catch (error) {
    if (error instanceof AuthError && error.name === 'UserUnAuthenticatedException') {
      return null
    }
    throw error
  }
}

export const assertContextSpecSignInDetails = async (
  context: GetServerSidePropsContext,
  contextSpec: AmplifyServer.ContextSpec,
) => {
  const signInDetails = await getSignInDetails(contextSpec)
  if (!signInDetails) {
    return
  }

  const signInDetailsCookie = Object.entries(context.req.cookies).find(([key]) =>
    /^CognitoIdentityServiceProvider\..+?\.signInDetails$/.test(key),
  )
  if (!signInDetailsCookie) {
    throw new Error('Expected signInDetails cookie not found')
  }

  const parsedValue = JSON.parse(
    (signInDetailsCookie as [string, string])[1],
  ) as CognitoAuthSignInDetails
  if (parsedValue.loginId !== signInDetails.loginId) {
    throw new Error('Expected signInDetails cookie value does not match')
  }
}
