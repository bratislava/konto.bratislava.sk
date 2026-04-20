import { e2eGlobalShared } from './e2e-global-shared'

export default async function e2eGlobalTeardown(): Promise<void> {
  const { postgresContainer } = e2eGlobalShared
  if (postgresContainer) {
    // `validate-nest-prisma-konto` currently fails to reconnect to Docker during Jest
    // globalTeardown on the runner, even though the E2E tests themselves pass. Keep
    // this commented out there until
    // https://github.com/bratislava/private-konto.bratislava.sk/issues/1409 migrates the
    // pipeline to Docker, where teardown works for some reason.
    if (process.env.CI) {
      console.log('Skipping container stop on CI')
      return
    }

    console.log('Stopping container')
    await postgresContainer.stop()
    console.log('Container stopped')
  } else {
    console.log('Container not found')
  }
}
