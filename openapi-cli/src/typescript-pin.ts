import { registerHooks } from 'node:module'
import { dirname, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import type * as ts from 'typescript'

import { CliError } from './cli-error'

/**
 * Forces `require('typescript')` inside `@nestjs/swagger` onto the backend's own copy.
 *
 * `@nestjs/swagger` declares no dependency on `typescript` at all, yet eight files under
 * `dist/plugin/**` require it at module scope. In this workspace that escapes to pnpm's
 * hidden hoist dir, which holds TypeScript 7 — the native port, whose entry is a stub with
 * no `ts.factory`. The plugin then dies with
 * `Cannot read properties of undefined (reading 'createImportEqualsDeclaration')`.
 *
 * Beyond the version, this guarantees the plugin and the CLI share **one** TypeScript
 * instance, so the `ts.Program` handed to the transformer belongs to the same realm.
 *
 * Scoped by `parentURL` rather than applied globally, so the backend's own code is free to
 * resolve `typescript` however it likes. Returns the function that undoes it.
 *
 * Must be installed before the first `require` of the swagger plugin: those requires are at
 * module scope, and Node caches modules by resolved filename, so a primed cache wins.
 */
export function pinTypescriptForSwagger(paths: {
  typescript: string
  swaggerPackageJson: string
}): () => void {
  const typescriptUrl = pathToFileURL(paths.typescript).href
  const swaggerRoot = pathToFileURL(
    dirname(paths.swaggerPackageJson) + sep,
  ).href

  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (
        specifier === 'typescript' &&
        context.parentURL?.startsWith(swaggerRoot) === true
      ) {
        return { url: typescriptUrl, format: 'commonjs', shortCircuit: true }
      }
      return nextResolve(specifier, context)
    },
  })

  return () => hooks.deregister()
}

/**
 * Turns the two ways this can silently go wrong into a diagnosable error.
 *
 * A second TypeScript in the process means some require escaped the pin, and a missing
 * `ts.factory` means the loaded copy is the native port. Both otherwise surface much later
 * as an unrelated-looking `TypeError` from deep inside the plugin.
 */
export function assertUsableTypescript(
  typescript: typeof ts,
  typescriptPath: string,
): void {
  const strays = Object.keys(require.cache).filter(
    (file) => /[\\/]typescript[\\/]/.test(file) && file !== typescriptPath,
  )
  if (strays.length > 0) {
    throw new CliError(
      `more than one TypeScript is loaded — expected only ${typescriptPath}, also found:\n${strays
        .map((stray) => `  ${stray}`)
        .join('\n')}`,
    )
  }

  if (typeof typescript.factory?.createImportEqualsDeclaration !== 'function') {
    throw new CliError(
      `TypeScript ${typescript.version} at ${typescriptPath} has no usable factory API — the @nestjs/swagger plugin needs the JavaScript compiler, not the native port`,
    )
  }
}
