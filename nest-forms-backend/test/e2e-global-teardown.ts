import { e2eGlobalShared } from './e2e-global-shared'

export default async function e2eGlobalTeardown(): Promise<void> {
  const { postgresContainer } = e2eGlobalShared
  if (postgresContainer) {
    const containerId = postgresContainer.getId()

    console.log(`Stopping container ${containerId}`)

    try {
      await postgresContainer.stop()
      console.log(`Container ${containerId} stopped`)
    } catch (error) {
      console.error(`Failed to stop container ${containerId} during Jest globalTeardown`)

      if (error instanceof AggregateError) {
        for (const nestedError of error.errors) {
          console.error(nestedError)
        }
      } else {
        console.error(error)
      }
    }
  } else {
    console.log('Container not found')
  }
}
