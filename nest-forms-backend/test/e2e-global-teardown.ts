import { e2eGlobalShared } from './e2e-global-shared'

export default async function e2eGlobalTeardown(): Promise<void> {
  const { postgresContainer } = e2eGlobalShared
  if (postgresContainer) {
    console.log('Stopping container')
    await postgresContainer.stop()
    console.log('Container stopped')
  } else {
    console.log('Container not found')
  }
}
