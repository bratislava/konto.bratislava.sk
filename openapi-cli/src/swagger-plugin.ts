import { join } from 'node:path'
import type * as ts from 'typescript'

import { CliError } from './cli-error'
import { readJsonFile } from './read-json'

/**
 * The `before` transformer exported by `@nestjs/swagger/plugin`. Declared locally rather
 * than imported so that this package never *value*-imports `@nestjs/swagger` — every
 * runtime module comes from the backend, by path. See `toolchain.ts`.
 */
export type SwaggerPluginBefore = (
  options?: Record<string, unknown>,
  program?: ts.Program,
) => ts.TransformerFactory<ts.SourceFile>

interface NestCliPlugin {
  name?: string
  options?: Record<string, unknown>
}

interface NestCliJson {
  compilerOptions?: {
    /** Both the object form and the bare-string shorthand are legal. */
    plugins?: (string | NestCliPlugin)[]
  }
}

/**
 * Reads the `@nestjs/swagger` plugin options out of the backend's own `nest-cli.json`, so
 * the CLI cannot drift from what `nest build` does.
 *
 * A missing plugin entry is a hard error, never a defaulted `{}`. Emitting without the
 * transformer produces a document that looks complete but has lost every inferred type —
 * the worst kind of failure, because it is silent.
 */
export function readSwaggerPluginOptions(
  backendDir: string,
): Record<string, unknown> {
  const configPath = join(backendDir, 'nest-cli.json')
  const { compilerOptions } = readJsonFile<NestCliJson>(
    configPath,
    'the @nestjs/swagger plugin options are read from it',
  )
  const plugins = compilerOptions?.plugins

  if (!Array.isArray(plugins)) {
    throw new CliError(
      `${configPath} has no compilerOptions.plugins — the @nestjs/swagger plugin is required`,
    )
  }

  const entry = plugins.find((plugin) =>
    typeof plugin === 'string'
      ? plugin === '@nestjs/swagger'
      : plugin.name === '@nestjs/swagger',
  )

  if (entry === undefined) {
    throw new CliError(
      `${configPath} does not configure the @nestjs/swagger plugin — without it the emitted document silently loses all inferred types`,
    )
  }

  return typeof entry === 'string' ? {} : (entry.options ?? {})
}
