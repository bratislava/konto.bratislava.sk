import type { BackendConfig } from './types'

/**
 * Every backend this CLI knows how to build a document for.
 *
 * A backend is wired up by adding its contract module (`entry`) and a `devDependency` on
 * `openapi-cli`; listing it here alone is not enough. Entries whose `entry` file does not
 * exist yet fail with a clear "contract module not found".
 *
 * `port` is declared rather than read from `process.env.PORT` so the emitted document is
 * identical on every machine — `ConfigModule.forRoot()` loads `.env` even under Nest's
 * preview mode, which would otherwise leak a developer's local port into the spec.
 */
export const backends: readonly BackendConfig[] = [
  {
    packageName: 'nest-city-account',
    entry: 'src/openapi.ts',
    tsconfig: 'tsconfig.build.json',
    port: 3000,
  },
  {
    packageName: 'nest-clamav-scanner',
    entry: 'src/openapi.ts',
    tsconfig: 'tsconfig.build.json',
    port: 3000,
  },
  {
    packageName: 'nest-forms-backend',
    entry: 'src/openapi.ts',
    tsconfig: 'tsconfig.build.json',
    port: 3000,
  },
  {
    packageName: 'nest-tax-backend',
    entry: 'src/openapi.ts',
    tsconfig: 'tsconfig.build.json',
    port: 3000,
  },
]
