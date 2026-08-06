import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { CliError } from './cli-error'

/**
 * Tried in order. `.env.spec` first because it is the fixture written to satisfy a backend's
 * config validation with dummy values; `.env.example` is the documented shape and is the
 * fallback for backends that have no spec fixture yet.
 *
 * A developer's real `.env` is deliberately not in this list — it is still picked up by the
 * backend's own `ConfigModule.forRoot()`, but only for variables these fixtures leave unset,
 * so the generated document does not depend on local secrets.
 */
const ENV_FILES = ['.env.spec', '.env.example']

/**
 * Loads a backend's environment fixture before its modules are required.
 *
 * Nest's `preview: true` skips provider *instantiation*, not module *definition* — and these
 * backends validate their environment inside the `@Module({ providers: [...] })` argument,
 * which runs on require. Without this the contract cannot even be loaded.
 *
 * Already-set variables win: `process.loadEnvFile` does not overwrite them, so `PORT=…` in a
 * real shell still takes precedence.
 */
export function loadBackendEnv(backendDir: string): string {
  for (const candidate of ENV_FILES) {
    const path = join(backendDir, candidate)
    if (!existsSync(path)) continue

    try {
      process.loadEnvFile(path)
    } catch (error) {
      throw new CliError(
        `cannot load ${path}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
    return candidate
  }

  throw new CliError(
    `${backendDir} has none of ${ENV_FILES.join(', ')} — one is needed because the backend validates its environment while its modules are being loaded`,
  )
}
