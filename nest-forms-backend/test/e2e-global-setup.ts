import { execSync } from 'node:child_process'

import { PostgreSqlContainer } from '@testcontainers/postgresql'

import { e2eGlobalShared } from './e2e-global-shared'

export default async function e2eGlobalSetup(): Promise<void> {
  const container = await new PostgreSqlContainer()
    .withUsername('forms')
    .withPassword('password')
    .withDatabase('forms')
    .start()

  process.env.DATABASE_URL = `postgresql://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}`
  e2eGlobalShared.postgresContainer = container

  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: process.env,
  })
}
