import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { PrismaPg } from '@prisma/adapter-pg'
import {
  MSSQLServerContainer,
  StartedMSSQLServerContainer,
} from '@testcontainers/mssqlserver'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { ConnectionPool } from 'mssql'

import { PrismaClient } from '../src/generated/prisma/client'

const NORIS_DATABASE = 'noris'
// Collation of the real Noris database, the queries rely on it being case-insensitive
const NORIS_COLLATION = 'SQL_Czech_CP1250_CI_AS'
const NORIS_SCHEMA_PATH = resolve(__dirname, 'noris', 'schema.sql')
// Same images as the services in `.github/workflows/build-nest.yml`, keep them in sync
const POSTGRES_IMAGE = 'postgres:16-alpine'
// SQL Server only publishes amd64 images, on arm64 hosts it runs emulated (Docker Desktop with Rosetta).
const MSSQL_IMAGE = 'mcr.microsoft.com/mssql/server:2022-CU28-ubuntu-22.04'
const MSSQL_PLATFORM = 'linux/amd64'

let postgresContainer: StartedPostgreSqlContainer | null = null
let mssqlContainer: StartedMSSQLServerContainer | null = null

async function setupPostgres(): Promise<void> {
  const ciE2eDatabaseUrl = process.env.CI_E2E_DATABASE_URL
  if (ciE2eDatabaseUrl) {
    process.env.DATABASE_URL = ciE2eDatabaseUrl
  } else {
    postgresContainer = await new PostgreSqlContainer(POSTGRES_IMAGE)
      .withUsername('tax')
      .withPassword('password')
      .withDatabase('tax')
      .start()

    process.env.DATABASE_URL = `postgresql://${postgresContainer.getUsername()}:${postgresContainer.getPassword()}@${postgresContainer.getHost()}:${postgresContainer.getPort()}/${postgresContainer.getDatabase()}`
  }

  // `migrate deploy` instead of `db push`, because the migrations also seed the `Config` rows the app relies on.
  // eslint-disable-next-line sonarjs/no-os-command-from-path -- pnpm is a dev tool resolved from PATH; the command is a fixed string with no user input
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
  })

  // The migrations seed `Config` rows valid since the migration ran, so tests with `setCurrentTime()` in the past would
  // not see them. Those rows become valid since ever. A row seeded with an explicit `validSince` keeps it, so a value
  // planned for a later date still waits for it.
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    await prisma.config.updateMany({
      // Without an explicit `validSince`, both columns default to the time of the insert
      where: { validSince: { equals: prisma.config.fields.createdAt } },
      data: { validSince: new Date(0) },
    })
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Splits a T-SQL script into batches on `GO` lines, the way sqlcmd/SSMS do. Statements such as `CREATE FUNCTION`
 * must be the only statement in their batch.
 */
function splitSqlBatches(script: string): string[] {
  const batches: string[][] = [[]]
  for (const line of script.split('\n')) {
    if (line.trim().toUpperCase() === 'GO') {
      batches.push([])
    } else {
      batches[batches.length - 1].push(line)
    }
  }
  return batches
    .map((lines) => lines.join('\n').trim())
    .filter((batch) => batch.length > 0)
}

async function setupNoris(): Promise<void> {
  const {
    CI_E2E_MSSQL_HOST,
    CI_E2E_MSSQL_PORT,
    CI_E2E_MSSQL_USERNAME,
    CI_E2E_MSSQL_PASSWORD,
  } = process.env
  if (CI_E2E_MSSQL_HOST) {
    // The port is empty when `.github/workflows/build-nest.yml` does not run the MSSQL service
    if (
      !CI_E2E_MSSQL_PORT ||
      !CI_E2E_MSSQL_USERNAME ||
      !CI_E2E_MSSQL_PASSWORD
    ) {
      throw new Error(
        'CI_E2E_MSSQL_PORT, CI_E2E_MSSQL_USERNAME or CI_E2E_MSSQL_PASSWORD is not set, enable `e2e_mssql` in the workflow',
      )
    }
    process.env.MSSQL_HOST = CI_E2E_MSSQL_HOST
    process.env.MSSQL_PORT = CI_E2E_MSSQL_PORT
    process.env.MSSQL_USERNAME = CI_E2E_MSSQL_USERNAME
    process.env.MSSQL_PASSWORD = CI_E2E_MSSQL_PASSWORD
  } else {
    mssqlContainer = await new MSSQLServerContainer(MSSQL_IMAGE)
      .withPlatform(MSSQL_PLATFORM)
      .acceptLicense()
      .start()

    process.env.MSSQL_HOST = mssqlContainer.getHost()
    process.env.MSSQL_PORT = mssqlContainer.getPort().toString()
    process.env.MSSQL_USERNAME = mssqlContainer.getUsername()
    process.env.MSSQL_PASSWORD = mssqlContainer.getPassword()
  }
  process.env.MSSQL_DB = NORIS_DATABASE

  const connectionConfig = {
    server: process.env.MSSQL_HOST,
    port: Number(process.env.MSSQL_PORT),
    user: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
    options: { encrypt: false, trustServerCertificate: true },
  }

  const masterPool = await new ConnectionPool({
    ...connectionConfig,
    database: 'master',
  }).connect()
  try {
    await masterPool
      .request()
      .batch(
        `IF DB_ID('${NORIS_DATABASE}') IS NOT NULL DROP DATABASE ${NORIS_DATABASE}; CREATE DATABASE ${NORIS_DATABASE} COLLATE ${NORIS_COLLATION};`,
      )
  } finally {
    await masterPool.close()
  }

  const norisPool = await new ConnectionPool({
    ...connectionConfig,
    database: NORIS_DATABASE,
  }).connect()
  try {
    for (const batch of splitSqlBatches(
      readFileSync(NORIS_SCHEMA_PATH, 'utf8'),
    )) {
      // eslint-disable-next-line no-await-in-loop -- batches depend on each other and must run in order
      await norisPool.request().batch(batch)
    }
  } finally {
    await norisPool.close()
  }
}

export async function setup(): Promise<void> {
  await Promise.all([setupPostgres(), setupNoris()])
}

export async function teardown(): Promise<void> {
  /* eslint-disable no-console -- intentional teardown progress output, no logger available in global setup */
  console.log('Stopping containers')
  await Promise.all([postgresContainer?.stop(), mssqlContainer?.stop()])
  console.log('Containers stopped')
  /* eslint-enable no-console */
}
