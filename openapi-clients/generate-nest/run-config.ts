import type {
  GenerateOpenApiClientsConfig,
  NestApplicationLike,
} from './generate-nest'
import {
  getPendingRunPromise,
  isOpenApiClientsInternalRunEnabled,
} from './generate-nest'

const getConfigPathFromArgs = () => {
  const configIndex = process.argv.indexOf('--config')
  if (configIndex === -1 || configIndex === process.argv.length - 1) {
    throw new Error('Missing required --config argument.')
  }

  return process.argv[configIndex + 1]
}

const loadConfig = (configPath: string) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(configPath)
}

const run = async () => {
  if (!isOpenApiClientsInternalRunEnabled()) {
    throw new Error(
      'This runner can only be executed by openapi-clients internal tooling.',
    )
  }

  const configPath = getConfigPathFromArgs()
  loadConfig(configPath)

  const pendingRunPromise = getPendingRunPromise()

  if (!pendingRunPromise) {
    throw new Error(
      'The provided config did not register an internal OpenAPI generation run.',
    )
  }

  await pendingRunPromise
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
