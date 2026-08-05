import { join } from 'node:path'

import { backends } from './backends'
import { CliError } from './cli-error'
import { readJsonFile } from './read-json'
import type { BackendConfig } from './types'

function readPackageName(directory: string): string {
  const packageJsonPath = join(directory, 'package.json')
  const { name } = readJsonFile<{ name?: string }>(
    packageJsonPath,
    'run this from a backend package directory',
  )

  if (typeof name !== 'string') {
    throw new CliError(`${packageJsonPath} has no "name"`)
  }
  return name
}

const knownNames = (): string =>
  backends.map((backend) => `  ${backend.packageName}`).join('\n')

/** Identifies which backend the CLI was invoked in, based on the working directory. */
export function resolveBackend(directory: string): {
  backend: BackendConfig
  backendDir: string
} {
  const packageName = readPackageName(directory)
  const backend = backends.find(
    (candidate) => candidate.packageName === packageName,
  )

  if (!backend) {
    throw new CliError(
      `not a known backend: ${packageName}\nknown backends:\n${knownNames()}`,
    )
  }

  return { backend, backendDir: directory }
}
