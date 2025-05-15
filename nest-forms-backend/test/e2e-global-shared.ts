import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql'

export const e2eGlobalShared: {
  postgresContainer: StartedPostgreSqlContainer | null
} = {
  postgresContainer: null,
}
