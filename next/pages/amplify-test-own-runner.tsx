// eslint-disable-next-line import/no-extraneous-dependencies
import { createServerRunner } from '@aws-amplify/adapter-nextjs'
// eslint-disable-next-line import/no-extraneous-dependencies
import { fetchUserAttributes } from '@aws-amplify/auth/server'
import type { AmplifyServer } from '@aws-amplify/core/dist/esm/adapterCore'
import { GetServerSideProps } from 'next'

import { environment } from '../environment'

type AmplifyTestOwnRunnerPageProps = {
  email: string | null | undefined
}

export const { runWithAmplifyServerContext } = createServerRunner({
  config: {
    Auth: {
      Cognito: {
        //  Amazon Cognito User Pool ID
        userPoolId: environment.cognitoUserPoolId,
        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolClientId: environment.cognitoClientId,
        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: environment.cognitoIdentityPoolId,
        // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
        // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
        signUpVerificationMethod: 'code', // 'code' | 'link'
      },
    },
  },
})

function randomDelayPromise() {
  // Generate a random delay between 0 and 2000 milliseconds
  const delay = Math.floor(Math.random() * 2001)

  // Return a new promise
  return new Promise<null>((resolve) => {
    setTimeout(() => {
      resolve(null) // Resolve the promise with an empty value after the delay
    }, delay)
  })
}

export const getServerSideProps: GetServerSideProps<AmplifyTestOwnRunnerPageProps> = async (
  ctx,
) => {
  const email = await runWithAmplifyServerContext({
    nextServerContext: { request: ctx.req, response: ctx.res },
    operation: async (contextSpec: AmplifyServer.ContextSpec) => {
      try {
        const attributes = await fetchUserAttributes(contextSpec)
        await randomDelayPromise()
        return attributes.email
      } catch (error) {
        return null
      }
    },
  })

  return {
    props: {
      email,
    },
  }
}

// eslint-disable-next-line react/function-component-definition
export default function AmplifyTestOwnRunner({ email }: AmplifyTestOwnRunnerPageProps) {
  return <div>{email}</div>
}
