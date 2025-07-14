import { e2eGlobalShared } from './e2e-global-shared'

export default async function e2eGlobalTeardown(): Promise<void> {
  const { postgresContainer } = e2eGlobalShared
  if (postgresContainer) {
    // eslint-disable-next-line no-console
    console.log('Stopping container')
    await postgresContainer.stop()
    // eslint-disable-next-line no-console
    console.log('Container stopped')
  } else {
    // eslint-disable-next-line no-console
    console.log('Container not found')
  }
}
