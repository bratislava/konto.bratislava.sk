import type { createAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core'

/* AmplifyServer.ContextSpec is not exported from the package, so we need to re-export it here */
export type AmplifyServerContextSpec = ReturnType<typeof createAmplifyServerContext>
