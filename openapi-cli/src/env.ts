import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { CliError } from './cli-error'

/**
 * Tried in order.
 *
 * `.env.spec` is the one that matters: it is the fixture written to satisfy a backend's config
 * validation with dummy values, and per `.dockerignore` it is the **only** `.env*` allowed
 * into the Docker build context. CI therefore needs it — an `.env.example` fallback that
 * happens to work locally would fail in the image.
 *
 * A developer's real `.env` is deliberately not in this list. It is still picked up by the
 * backend's own `ConfigModule.forRoot()`, but only for variables the fixture leaves unset, so
 * a generated spec never depends on local secrets.
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
