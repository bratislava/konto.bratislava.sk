import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type * as ts from 'typescript'

import { CliError } from './cli-error'

/**
 * The `before` transformer exported by `@nestjs/swagger/plugin`. Declared locally rather
 * than imported so that this package never *value*-imports `@nestjs/swagger` — every
 * runtime module comes from the backend, by path. See `host-modules.ts`.
 */
export type SwaggerPluginBefore = (
  options?: Record<string, unknown>,
  program?: ts.Program,
) => ts.TransformerFactory<ts.SourceFile>

interface NestCliPlugin {
  name?: string
  options?: Record<string, unknown>
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

  let contents: string
  try {
    contents = readFileSync(configPath, 'utf8')
  } catch {
    throw new CliError(`cannot read ${configPath}`)
  }

  const parsed: unknown = JSON.parse(contents)
  const plugins: unknown =
    typeof parsed === 'object' && parsed !== null
      ? (parsed as { compilerOptions?: { plugins?: unknown } }).compilerOptions
          ?.plugins
      : undefined

  if (!Array.isArray(plugins)) {
    throw new CliError(
      `${configPath} has no compilerOptions.plugins — the @nestjs/swagger plugin is required`,
    )
  }

  // Both the object form and the bare-string shorthand are legal in nest-cli.json.
  const entry = plugins.find((plugin: unknown) =>
    typeof plugin === 'string'
      ? plugin === '@nestjs/swagger'
      : (plugin as NestCliPlugin)?.name === '@nestjs/swagger',
  )

  if (entry === undefined) {
    throw new CliError(
      `${configPath} does not configure the @nestjs/swagger plugin — without it the emitted document silently loses all inferred types`,
    )
  }

  return typeof entry === 'string'
    ? {}
    : ((entry as NestCliPlugin).options ?? {})
}
