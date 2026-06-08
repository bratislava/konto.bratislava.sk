import { execSync } from 'node:child_process'

import { PostgreSqlContainer } from '@testcontainers/postgresql'

import { e2eGlobalShared, getCiE2eDatabaseUrl } from './e2e-global-shared'

export default async function e2eGlobalSetup(): Promise<void> {
  const ciE2eDatabaseUrl = getCiE2eDatabaseUrl()
  if (ciE2eDatabaseUrl) {
    process.env.DATABASE_URL = ciE2eDatabaseUrl
  } else {
    const container = await new PostgreSqlContainer('postgres:alpine')
      .withUsername('forms')
      .withPassword('password')
      .withDatabase('forms')
      .start()

    process.env.DATABASE_URL = `postgresql://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}`
    e2eGlobalShared.postgresContainer = container
  }

  // eslint-disable-next-line sonarjs/no-os-command-from-path
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: process.env,
  })
}
