import type { AmplifyServer } from '@aws-amplify/core/dist/esm/adapterCore'
import { fetchUserAttributes } from 'aws-amplify/auth/server'
import { GetServerSideProps } from 'next'

import { baRunWithAmplifyServerContext } from '../frontend/utils/amplifyServerRunner'

type AmplifyTestPageProps = {
  email: string | null | undefined
}

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

export const getServerSideProps: GetServerSideProps<AmplifyTestPageProps> = async (ctx) => {
  const email = await baRunWithAmplifyServerContext({
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
export default function AmplifyTest({ email }: AmplifyTestPageProps) {
  return <div>{email}</div>
}
