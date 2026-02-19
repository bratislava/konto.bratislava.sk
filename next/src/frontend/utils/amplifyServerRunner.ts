import { createServerRunner } from '@aws-amplify/adapter-nextjs'

import { amplifyConfig } from '@/src/frontend/utils/amplifyConfig'

export const { runWithAmplifyServerContext: baRunWithAmplifyServerContext } = createServerRunner({
  config: amplifyConfig,
})
