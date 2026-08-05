import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { backends } from './backends'
import { CliError } from './cli-error'
import type { BackendConfig } from './types'

function readPackageName(directory: string): string {
  let contents: string
  try {
    contents = readFileSync(join(directory, 'package.json'), 'utf8')
  } catch {
    throw new CliError(
      `no package.json in ${directory} — run this from a backend package directory`,
    )
  }

  const parsed: unknown = JSON.parse(contents)
  const name =
    typeof parsed === 'object' && parsed !== null
      ? (parsed as { name?: unknown }).name
      : undefined

  if (typeof name !== 'string') {
    throw new CliError(`${join(directory, 'package.json')} has no "name"`)
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
