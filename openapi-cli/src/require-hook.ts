import { addHook } from 'pirates'

import { CliError } from './cli-error'
import { type CompiledSources, normalizePath } from './types'

/**
 * Teaches `require` to serve the backend's compiled TypeScript out of memory. Returns the
 * function that undoes it.
 *
 * `pirates` does the fiddly parts — registering `.ts` in `Module._extensions` (which is what
 * also puts it in the CJS resolver's extension-probe list, so extensionless imports like
 * `require('./app.module')` resolve), chaining any handler already installed, driving
 * `module._compile`, and handing back a `revert`. It is the same mechanism `babel-register`
 * uses.
 *
 * Note this cannot be `module.registerHooks({ load })`: a `load` hook is never consulted for
 * an extensionless import, because resolution fails before loading is reached.
 */
export function installRequireHook(options: {
  sources: CompiledSources
  configPath: string
}): () => void {
  const { sources, configPath } = options

  return addHook(
    // The file's own contents are deliberately ignored: what must run is the output the
    // swagger transformer produced, not the source on disk.
    (_code, filename) => {
      const source = sources.get(normalizePath(filename))
      if (source === undefined) {
        // Never fall through. Node can strip types from an untransformed file and load it
        // happily, which would silently produce a document missing its inferred types.
        throw new CliError(
          `${filename} was required but is not in the file list of ${configPath} — if it is excluded there, it cannot be reachable from the contract module`,
        )
      }
      return source
    },
    // `ignoreNodeModules` defaults to true, so a dependency shipping raw TypeScript still
    // loads through whatever handler was already in place.
    { exts: ['.ts'] },
  )
}
