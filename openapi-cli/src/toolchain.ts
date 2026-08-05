import type { NestFactory } from '@nestjs/core'
import type * as ts from 'typescript'

import type { Disposable } from './disposable'
import { resolveHostModulePaths } from './host-modules'
import type { SwaggerPluginBefore } from './swagger-plugin'
import { assertUsableTypescript, pinTypescriptForSwagger } from './typescript-pin'

export interface BackendToolchain extends Disposable {
  readonly typescript: typeof ts
  readonly swaggerBefore: SwaggerPluginBefore
  readonly nestFactory: typeof NestFactory
}

/**
 * Borrows the compiler and Nest runtime from the backend.
 *
 * Order matters: the TypeScript pin goes in before the swagger plugin is required, because
 * that plugin resolves `typescript` at module scope and Node's module cache would otherwise
 * lock in the wrong copy.
 */
export function loadBackendToolchain(backendDir: string): BackendToolchain {
  const paths = resolveHostModulePaths(backendDir)
  const pin = pinTypescriptForSwagger(paths)

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

    return {
      typescript,
      swaggerBefore: before,
      nestFactory,
      dispose: () => pin.dispose(),
    }
  } catch (error) {
    pin.dispose()
    throw error
  }
}
