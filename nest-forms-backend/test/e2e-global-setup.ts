import { execSync } from 'node:child_process'

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'

let postgresContainer: StartedPostgreSqlContainer | null = null

export async function setup(): Promise<void> {
  const ciE2eDatabaseUrl = process.env.CI_E2E_DATABASE_URL
  if (ciE2eDatabaseUrl) {
    process.env.DATABASE_URL = ciE2eDatabaseUrl
  } else {
    postgresContainer = await new PostgreSqlContainer('postgres:alpine')
      .withUsername('forms')
      .withPassword('password')
      .withDatabase('forms')
      .start()

    process.env.DATABASE_URL = `postgresql://${postgresContainer.getUsername()}:${postgresContainer.getPassword()}@${postgresContainer.getHost()}:${postgresContainer.getPort()}/${postgresContainer.getDatabase()}`
  }

  // eslint-disable-next-line sonarjs/no-os-command-from-path -- pnpm is a dev tool resolved from PATH; the command is a fixed string with no user input
  execSync('pnpm exec prisma db push', {
    stdio: 'inherit',
    env: process.env,
  })
}

export async function teardown(): Promise<void> {
  /* eslint-disable no-console -- intentional teardown progress output, no logger available in global setup */
  if (process.env.CI_E2E_DATABASE_URL) {
    console.log('Using workflow-provided Postgres, skipping container stop')
    return
  }

  if (postgresContainer) {
    console.log('Stopping container')
    await postgresContainer.stop()
    console.log('Container stopped')
  } else {
    console.log('Container not found')
  }
  /* eslint-enable no-console */
}
