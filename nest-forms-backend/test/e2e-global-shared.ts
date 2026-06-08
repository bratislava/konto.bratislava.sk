import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql'

export function getCiE2eDatabaseUrl() {
  return process.env.CI_E2E_DATABASE_URL ?? null
}

export const e2eGlobalShared: {
  postgresContainer: StartedPostgreSqlContainer | null
} = {
  postgresContainer: null,
}
