import { CliError } from './cli-error'
import type { OpenApiContract } from './types'

/**
 * Checks a required module actually implements the contract, reporting everything wrong at
 * once. Without this, a missing export surfaces as `undefined is not a constructor` from
 * inside Nest, which says nothing about what the backend needs to add.
 */
export function asOpenApiContract(
  loaded: unknown,
  entryPath: string,
): OpenApiContract {
  const module = (loaded ?? {}) as Partial<OpenApiContract>
  const problems: string[] = []

  if (typeof module.AppModule !== 'function') {
    problems.push('AppModule (a class)')
  }
  if (typeof module.createSwaggerDocument !== 'function') {
    problems.push('createSwaggerDocument (a function)')
  }
  if (
    module.prepareApp !== undefined &&
    typeof module.prepareApp !== 'function'
  ) {
    problems.push('prepareApp (a function, when present)')
  }

  if (problems.length > 0) {
    throw new CliError(
      `${entryPath} does not implement the openapi-cli contract — missing or wrong: ${problems.join(', ')}`,
    )
  }

  return module as OpenApiContract
}
