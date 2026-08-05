import { createRequire } from 'node:module'

import { CliError } from './cli-error'
import type { Disposable } from './disposable'

/** Emitted JavaScript, keyed by the normalized absolute path of its `.ts` source. */
export type CompiledSources = Map<string, string>

export const normalizePath = (path: string): string => path.replace(/\\/g, '/')

const registry = createRequire(__filename).extensions
type ExtensionHandler = NonNullable<(typeof registry)['.js']>

/**
 * `module._compile` is a Node internal that `@types/node` deliberately omits. Declared as a
 * named interface rather than suppressed with `@ts-expect-error` so the call stays checked.
 */
interface CompilableModule {
  _compile(code: string, filename: string): unknown
}

/**
 * Teaches `require` to serve the backend's compiled TypeScript out of memory.
 *
 * This has to be `require.extensions['.ts']` and not the newer
 * `module.registerHooks({ load })`. Assigning the extension does double duty: as well as
 * compiling the file, it adds `.ts` to the CJS resolver's extension-probe list, which is
 * what makes extensionless imports like `require('./app.module')` resolve at all. A `load`
 * hook alone is never consulted, because resolution fails first — verified:
 * `Cannot find module './config/ba-config.service'`.
 *
 * The previous handler, if any, is chained rather than clobbered, so a `.ts` file outside
 * the compiled program (a dependency shipping raw TypeScript, or a pre-registered ts-node)
 * still loads.
 */
export function installRequireHook(options: {
  sources: CompiledSources
  configPath: string
}): Disposable {
  const { sources, configPath } = options

  // Windows require() preserves the caller's casing while TypeScript reports the casing it
  // was given, so an exact lookup can miss. Built on the first miss, by which point
  // `sources` is fully populated.
  let byLowercasePath: CompiledSources | undefined
  const lookup = (path: string): string | undefined => {
    const exact = sources.get(path)
    if (exact !== undefined) return exact
    byLowercasePath ??= new Map(
      [...sources].map(([key, value]) => [key.toLowerCase(), value]),
    )
    return byLowercasePath.get(path.toLowerCase())
  }

  const previous = registry['.ts']

  const handler: ExtensionHandler = (module, filename) => {
    const source = lookup(normalizePath(filename))
    if (source === undefined) {
      if (previous) {
        previous(module, filename)
        return
      }
      throw new CliError(
        `${filename} was required but is not in the file list of ${configPath} — if it is excluded there, it cannot be reachable from the contract module`,
      )
    }
    ;(module as unknown as CompilableModule)._compile(source, filename)
  }

  registry['.ts'] = handler

  return {
    dispose: () => {
      if (previous === undefined) delete registry['.ts']
      else registry['.ts'] = previous
    },
  }
}
