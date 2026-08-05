import type { OpenAPIObject } from '@nestjs/swagger'
import type { Command } from 'commander'

import type { BackendConfig } from '../types'

export interface ActionContext {
  backend: BackendConfig
  /** Absolute path to the backend package root. */
  backendDir: string
  /** The finished document, as plain JSON. */
  document: OpenAPIObject
}

/**
 * A unit of work over the finished document.
 *
 * Actions receive plain JSON and must not touch Nest or TypeScript — all of that is resolved
 * before they run. `Options` is inferred per action from `configureOptions`' flags.
 */
export interface Action<Options> {
  name: string
  description: string
  configureOptions?(command: Command): void
  run(context: ActionContext, options: Options): Promise<void> | void
}
