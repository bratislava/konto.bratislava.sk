import type {
  GenerateOpenApiClientsConfig,
  NestApplicationLike,
} from './generate-nest'
import { generateProjectSpec } from './generate-nest'

const getConfigPathFromArgs = () => {
  const configIndex = process.argv.indexOf('--config')
  if (configIndex === -1 || configIndex === process.argv.length - 1) {
    throw new Error('Missing required --config argument.')
  }

  return process.argv[configIndex + 1]
}

const loadConfig = (
  configPath: string,
): GenerateOpenApiClientsConfig<NestApplicationLike> => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const imported = require(configPath)
  return imported.default ?? imported
}

const configPath = getConfigPathFromArgs()
const config = loadConfig(configPath)

generateProjectSpec(config).catch((error) => {
  console.error(error)
  process.exit(1)
})
