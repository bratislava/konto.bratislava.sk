import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { rimrafSync } from 'rimraf'
import camelcase from 'camelcase'

interface GenerateClientOptions {
  rootDir?: string
}

export const validTypes = [
  'forms',
  'tax',
  'city-account',
  'slovensko-sk',
  'clamav-scanner',
] as const
export type ValidType = (typeof validTypes)[number]

export const endpoints: Record<ValidType, string> = {
  forms: 'https://nest-forms-backend.staging.bratislava.sk/api-json',
  tax: 'https://nest-tax-backend.staging.bratislava.sk/api-json',
  'city-account': 'https://nest-city-account.staging.bratislava.sk/api-json',
  'clamav-scanner': 'https://nest-clamav-scanner.staging.bratislava.sk/api-json',
  'slovensko-sk': 'https://fix.slovensko-sk-api.bratislava.sk/openapi.yaml',
}

/**
 * Adds missing type definitions to the generated slovensko-sk API code.
 * The OpenAPI generator incorrectly handles Base64 and Uuid types,
 * treating them as unknown types instead of strings.
 */
const customizeSlovenskoSkGeneratedCode = (type: ValidType, outputDir: string) => {
  if (type !== 'slovensko-sk') {
    return
  }

  console.log(`Customizing generated code for ${type}...`)
  const apiPath = path.join(outputDir, 'api.ts')
  let content = readFileSync(apiPath, 'utf8')
  content = `type Base64 = string\ntype Uuid = string\n\n${content}`
  writeFileSync(apiPath, content)
}

const generateClientFile = (type: ValidType, outputDir: string) => {
  console.log(`Generating client file for ${type}...`)
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
}

const updateIndexFile = (type: ValidType, outputDir: string) => {
  console.log(`Updating index file for ${type}...`)
  const indexPath = path.join(outputDir, 'index.ts')
  const content = readFileSync(indexPath, 'utf8')

  const updatedContent = content.replace(
    'export * from "./configuration"',
    'export * from "./configuration"\nexport * from "./client"',
  )

  writeFileSync(indexPath, updatedContent)
}

const formatGeneratedCode = (type: ValidType, outputDir: string) => {
  console.log(`Formatting generated code for ${type}...`)
  execSync(`prettier --write ${outputDir}`, { stdio: 'inherit' })
}

const cleanupExistingClient = (type: ValidType, outputDir: string) => {
  console.log(`Removing existing client for ${type}...`)
  rimrafSync(outputDir)
}

const generateOpenApiClient = (type: ValidType, url: string, outputDir: string) => {
  console.log(`Generating OpenAPI client for ${type}...`)
  execSync(
    `npx @openapitools/openapi-generator-cli generate \
      -i ${url} \
      -g typescript-axios \
      -o ${outputDir} \
      --skip-validate-spec`,
    { stdio: 'inherit' },
  )
}

export const generateClient = async (type: ValidType, options: GenerateClientOptions = {}) => {
  const outputDir = path.join(options.rootDir ?? '.', type)
  const url = endpoints[type]

  try {
    cleanupExistingClient(type, outputDir)
    generateOpenApiClient(type, url, outputDir)
    generateClientFile(type, outputDir)
    updateIndexFile(type, outputDir)
    customizeSlovenskoSkGeneratedCode(type, outputDir)
    formatGeneratedCode(type, outputDir)

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
  import('commander').then(({ Command }) => {
    const program = new Command()

    program
      .name('generateClient')
      .description('Generate OpenAPI client for specified type')
      .argument('<type>', `Type of client to generate (${validTypes.join(', ')})`)
      .action((type: string) => {
        if (!isValidType(type)) {
          console.error(`Invalid type: ${type}. Valid types are: ${validTypes.join(', ')}.`)
          process.exit(1)
        }

        generateClient(type).catch(() => process.exit(1))
      })

    program.parse()
  })
}
