import { createServerRunner } from '@aws-amplify/adapter-nextjs'

import { amplifyConfig } from './amplifyConfig'

export const { runWithAmplifyServerContext } = createServerRunner({
  config: amplifyConfig,
})
