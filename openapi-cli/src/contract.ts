import { CliError } from './cli-error'
import type { OpenApiContract } from './types'

/**
 * Checks a required module default-exports something implementing the contract, reporting
 * everything wrong at once. Without this, a missing export surfaces as
 * `undefined is not a constructor` from inside Nest, which says nothing about what the
 * backend needs to add.
 */
export function asOpenApiContract(
  loaded: unknown,
  entryPath: string,
): OpenApiContract {
  const contract = (loaded as { default?: Partial<OpenApiContract> } | undefined)
    ?.default

  if (contract === undefined) {
    throw new CliError(
      `${entryPath} has no default export — it must default-export { projectName, AppModule, createSwaggerDocument }`,
    )
  }

  const problems: string[] = []
  if (typeof contract.projectName !== 'string' || contract.projectName === '') {
    problems.push('projectName (a non-empty string)')
  }
  if (typeof contract.AppModule !== 'function') {
    problems.push('AppModule (a class)')
  }
  if (typeof contract.createSwaggerDocument !== 'function') {
    problems.push('createSwaggerDocument (a function)')
  }
  if (
    contract.prepareApp !== undefined &&
    typeof contract.prepareApp !== 'function'
  ) {
    problems.push('prepareApp (a function, when present)')
  }

  if (problems.length > 0) {
    throw new CliError(
      `the default export of ${entryPath} does not implement the openapi-cli contract — missing or wrong: ${problems.join(', ')}`,
    )
  }

  return contract as OpenApiContract
}
