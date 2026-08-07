import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { CliError } from './cli-error'

/** The contract module every backend exposes, relative to its package root. */
const CONTRACT_ENTRY = 'src/openapi.ts'

export interface Backend {
  /** Absolute path to the backend package root. */
  directory: string
  /** Absolute path to the contract module. */
  entryPath: string
  /** Absolute path to the tsconfig whose file list and options the compile uses. */
  tsconfigPath: string
}

/**
 * The backend is simply the directory the CLI was invoked in. It is installed as a
 * devDependency there and run from that package's own script, so the caller already
 * determines the target — there is nothing for the CLI to be told.
 */
export function resolveBackend(directory: string): Backend {
  const entryPath = join(directory, CONTRACT_ENTRY)

  // Checked before the multi-second compile, so an unwired directory fails immediately.
  if (!existsSync(entryPath)) {
    throw new CliError(
      `${directory} is not a wired-up backend — expected ${CONTRACT_ENTRY} exporting { AppModule, createSwaggerDocument }`,
    )
  }

  return { directory, entryPath, tsconfigPath: resolveTsconfigPath(directory) }
}

/**
 * Mirrors what `nest build` does: @nestjs/cli picks `tsconfig.build.json` when it exists and
 * falls back to `tsconfig.json`, purely by checking the filesystem (see its
 * `getDefaultTsconfigPath`). Deriving it the same way rather than declaring it means the CLI
 * cannot drift from the production build.
 */
function resolveTsconfigPath(directory: string): string {
  const buildConfig = join(directory, 'tsconfig.build.json')
  return existsSync(buildConfig) ? buildConfig : join(directory, 'tsconfig.json')
}
