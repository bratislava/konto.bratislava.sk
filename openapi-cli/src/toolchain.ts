import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import type { NestFactory } from '@nestjs/core'
import type * as ts from 'typescript'

import { CliError } from './cli-error'
import type { SwaggerPluginBefore } from './swagger-plugin'
import {
  assertUsableTypescript,
  pinTypescriptForSwagger,
} from './typescript-pin'

export interface BackendToolchain {
  readonly typescript: typeof ts
  readonly swaggerBefore: SwaggerPluginBefore
  readonly nestFactory: typeof NestFactory
  /** Undoes the TypeScript pin. */
  readonly revert: () => void
}

/**
 * Resolves the modules the CLI borrows from the backend.
 *
 * They come from the backend rather than from this package for two different reasons.
 * `typescript` compiles the *backend's* source, so it must be the backend's compiler — the
 * same one `nest build` uses, or the emitted document could differ from the deployed one.
 * The `@nestjs/*` modules must be the exact instances the backend's compiled code requires:
 * `NestFactory` has to be the copy whose `@nestjs/common` wrote the decorator metadata it
 * reads back. This is why `openapi-cli` has no runtime dependency on either; they are
 * type-only devDependencies.
 *
 * Resolution happens before any module hook is installed, because calling `require.resolve`
 * inside a `resolve` hook re-enters it and overflows the stack.
 */
function resolvePaths(backendDir: string): {
  typescript: string
  swaggerPlugin: string
  swaggerPackageJson: string
  nestCore: string
} {
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

/**
 * Borrows the compiler and Nest runtime from the backend.
 *
 * Order matters: the TypeScript pin goes in before the swagger plugin is required, because
 * that plugin resolves `typescript` at module scope and Node's module cache would otherwise
 * lock in the wrong copy.
 */
export function loadBackendToolchain(backendDir: string): BackendToolchain {
  const paths = resolvePaths(backendDir)
  const revert = pinTypescriptForSwagger(paths)

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- resolved by absolute
    // path so the backend's instance is used, not this package's type-only devDependency.
    const typescript = require(paths.typescript) as typeof ts
    assertUsableTypescript(typescript, paths.typescript)

    const { before } = require(paths.swaggerPlugin) as {
      before: SwaggerPluginBefore
    }
    const { NestFactory: nestFactory } = require(paths.nestCore) as {
      NestFactory: typeof NestFactory
    }

    return { typescript, swaggerBefore: before, nestFactory, revert }
  } catch (error) {
    revert()
    throw error
  }
}
