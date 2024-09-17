import { fetchUserAttributes } from 'aws-amplify/auth/server'
import { GetServerSideProps } from 'next'

import { assertContextSpecAndIdToken } from '../frontend/utils/amplifyAssert'
import { baRunWithAmplifyServerContext } from '../frontend/utils/amplifyServerRunner'
import { AmplifyServerContextSpec } from '../frontend/utils/amplifyTypes'

type AmplifyTestPageProps = {
  email: string | null | undefined
  assert: boolean
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
  const assert = ctx.query.assert === 'true'

  const email = await baRunWithAmplifyServerContext({
    nextServerContext: { request: ctx.req, response: ctx.res },
    operation: async (contextSpec: AmplifyServerContextSpec) => {
      if (assert) {
        await assertContextSpecAndIdToken(ctx, contextSpec)
      }

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
      assert,
    },
  }
}

// eslint-disable-next-line react/function-component-definition
export default function AmplifyTest({ email, assert }: AmplifyTestPageProps) {
  return (
    <div>
      {email} {assert}
    </div>
  )
}
