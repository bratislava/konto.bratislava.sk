import type { Command } from 'commander'

import type { Action, ActionContext } from './action'
import { emitAction } from './emit'

/** Compiles the backend and builds the document. Called only once an action actually runs. */
export type LoadActionContext = () => Promise<ActionContext>

/**
 * Registering through a generic function rather than iterating an array is what keeps this
 * type-safe: a heterogeneous `Action<unknown>[]` cannot be typed without `any`, because
 * `run`'s options parameter is checked contravariantly. Here `Options` is inferred per call.
 */
function registerAction<Options>(
  program: Command,
  loadContext: LoadActionContext,
  action: Action<Options>,
): void {
  const command = program.command(action.name).description(action.description)
  action.configureOptions?.(command)
  command.action(async (options: Options) => {
    await action.run(await loadContext(), options)
  })
}

/** The single place actions are listed. Add new ones here. */
export function registerActions(
  program: Command,
  loadContext: LoadActionContext,
): void {
  registerAction(program, loadContext, emitAction)
}
