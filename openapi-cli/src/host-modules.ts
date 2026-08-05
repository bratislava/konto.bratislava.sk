import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

import { CliError } from './cli-error'

/**
 * Absolute paths to the modules the CLI borrows from the backend it is operating on.
 *
 * These come from the backend rather than from this package so that the CLI uses the
 * backend's own versions and, crucially, the *same module instances* the backend's compiled
 * code will require. A second `@nestjs/core` would mean decorator metadata written by one
 * copy and read by another — the classic empty-metadata failure. This is why `openapi-cli`
 * has no runtime dependency on `@nestjs/*` or `typescript`; they are type-only devDependencies.
 *
 * Resolution happens before any module hook is installed: calling `require.resolve` inside a
 * `resolve` hook re-enters it and overflows the stack.
 */
export interface HostModulePaths {
  typescript: string
  swaggerPlugin: string
  swaggerPackageJson: string
  nestCore: string
}

export function resolveHostModulePaths(backendDir: string): HostModulePaths {
  const backendRequire = createRequire(pathToFileURL(`${backendDir}/`))

  // realpath, because Node keys its module cache and hook `parentURL`s by real paths, never
  // by the pnpm symlinks.
  const resolve = (specifier: string): string => {
    try {
      return realpathSync(backendRequire.resolve(specifier))
    } catch {
      throw new CliError(
        `cannot resolve "${specifier}" from ${backendDir} — are the backend's node_modules installed?`,
      )
    }
  }

  return {
    typescript: resolve('typescript'),
    swaggerPlugin: resolve('@nestjs/swagger/plugin'),
    swaggerPackageJson: resolve('@nestjs/swagger/package.json'),
    nestCore: resolve('@nestjs/core'),
  }
}
