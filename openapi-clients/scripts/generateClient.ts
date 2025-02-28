import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { rimrafSync } from 'rimraf'
import { endpoints, ValidType, validTypes } from './types'
import camelcase from 'camelcase'

interface GenerateClientOptions {
  rootDir?: string
}

export const getOutputDirs = (rootDir = '.'): Record<ValidType, string> => ({
  forms: path.join(rootDir, 'forms'),
  tax: path.join(rootDir, 'tax'),
  'city-account': path.join(rootDir, 'city-account'),
  'clamav-scanner': path.join(rootDir, 'clamav-scanner'),
  'slovensko-sk': path.join(rootDir, 'slovensko-sk'),
})

/**
 * Adds missing type definitions to the generated slovensko-sk API code.
 * The OpenAPI generator incorrectly handles Base64 and Uuid types,
 * treating them as unknown types instead of strings.
 */
const customizeSlovenskoSkGeneratedCode = (outputDir: string) => {
  const apiPath = path.join(outputDir, 'api.ts')
  let content = readFileSync(apiPath, 'utf8')
  content = `type Base64 = string\ntype Uuid = string\n\n${content}`
  writeFileSync(apiPath, content)
}

const generateClientFile = (type: ValidType, outputDir: string) => {
  const apiPath = path.join(outputDir, 'api.ts')
  const content = readFileSync(apiPath, 'utf8')

  const factoryRegex = /export const (\w+Factory)/g
  const factories = Array.from(content.matchAll(factoryRegex)).map((match) => match[1])

  if (factories.length === 0) {
    throw new Error(`No API factories found in generated code for ${type}`)
  }

  const clientName = camelcase(type, { pascalCase: true })

  const clientContent = `
import { ${factories.join(', ')} } from './api'
import { Configuration } from './configuration'
import type { AxiosInstance } from 'axios'

export const create${clientName}Client = (
  configuration: Configuration = {} as Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) => {
  const args = [configuration, basePath, axios] as const

  return {
    ${factories.map((factory) => `...${factory}(...args)`).join(',\n    ')}
  }
}
`

  const clientPath = path.join(outputDir, 'client.ts')
  writeFileSync(clientPath, clientContent)
  console.log(`Generated client file for ${type}`)
}

const updateIndexFile = (type: ValidType, outputDir: string) => {
  const indexPath = path.join(outputDir, 'index.ts')
  const content = readFileSync(indexPath, 'utf8')

  const updatedContent = content.replace(
    'export * from "./configuration"',
    'export * from "./configuration"\nexport * from "./client"',
  )

  writeFileSync(indexPath, updatedContent)
  console.log(`Updated index file for ${type}`)
}

const formatGeneratedCode = (outputDir: string) => {
  console.log('Formatting generated code with Prettier...')
  execSync(`prettier --write ${outputDir}`, { stdio: 'inherit' })
}

export const generateClient = async (type: ValidType, options: GenerateClientOptions = {}) => {
  const outputDirs = getOutputDirs(options.rootDir)
  const url = endpoints[type]
  const outputDir = outputDirs[type]

  try {
    console.log(`Removing existing client for ${type}...`)
    rimrafSync(outputDir)
    console.log(`Generating client for ${type}...`)

    execSync(
      `npx @openapitools/openapi-generator-cli generate \
        -i ${url} \
        -g typescript-axios \
        -o ${outputDir} \
        --skip-validate-spec`,
      { stdio: 'inherit' },
    )

    generateClientFile(type, outputDir)
    updateIndexFile(type, outputDir)

    if (type === 'slovensko-sk') {
      console.log(`Customizing generated code for ${type}...`)
      customizeSlovenskoSkGeneratedCode(outputDir)
    }

    formatGeneratedCode(outputDir)

    console.log(`Client generation for ${type} completed successfully.`)
  } catch (error) {
    console.error(`Error generating client for ${type}:`, error)
    throw error
  }
}

const isValidType = (type: string): type is ValidType => {
  return validTypes.includes(type as ValidType)
}

if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.length !== 1) {
    console.error('Usage: tsx generateClient.ts <type>')
    console.error(`Valid types: ${validTypes.join(', ')}`)
    process.exit(1)
  }

  const type = args[0]
  if (!isValidType(type)) {
    console.error(`Invalid type: ${type}. Valid types are: ${validTypes.join(',')}.`)
    process.exit(1)
  }

  generateClient(type).catch(() => process.exit(1))
}
