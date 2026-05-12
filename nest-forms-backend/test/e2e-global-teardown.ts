import { e2eGlobalShared, getCiE2eDatabaseUrl } from './e2e-global-shared'

export default async function e2eGlobalTeardown(): Promise<void> {
  const ciE2eDatabaseUrl = getCiE2eDatabaseUrl()
  if (ciE2eDatabaseUrl) {
    console.log('Using workflow-provided Postgres, skipping container stop')
    return
  }

  const { postgresContainer } = e2eGlobalShared
  if (postgresContainer) {
    console.log('Stopping container')
    await postgresContainer.stop()
    console.log('Container stopped')
  } else {
    console.log('Container not found')
  }
}
