import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { rimrafSync } from 'rimraf'
import camelcase from 'camelcase'
import { get as getAppRootDir } from 'app-root-dir'
import fetch from 'node-fetch'
import semver from 'semver'
import { randomUUID } from 'node:crypto'

interface GenerateClientOptions {
  rootDir?: string
  useLocal?: boolean
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

export const localFolders: Partial<Record<ValidType, string>> = {
  forms: 'nest-forms-backend',
  tax: 'nest-tax-backend',
  'city-account': 'nest-city-account',
  'clamav-scanner': 'nest-clamav-scanner',
}

const appRootDir = getAppRootDir()

async function checkOpenApiGeneratorVersion() {
  const openapitoolsConfigPath = path.join(appRootDir, 'openapitools.json')
  const openapitoolsConfig = JSON.parse(readFileSync(openapitoolsConfigPath, 'utf8'))
  const currentVersion = openapitoolsConfig['generator-cli']?.version

  try {
    const res = await fetch(
      'https://search.maven.org/solrsearch/select?q=g:org.openapitools+AND+a:openapi-generator-cli&rows=1&wt=json',
    )
    if (!res.ok) {
      console.warn('Could not fetch latest OpenAPI Generator CLI version.')
      return
    }
    const data = await res.json()
    const latestVersion = data.response?.docs?.[0]?.latestVersion
    if (!latestVersion) {
      console.warn('Could not determine latest OpenAPI Generator CLI version.')
      return
    }
    if (currentVersion && semver.lt(currentVersion, latestVersion)) {
      console.log(
        `Your version (${currentVersion}) is behind the latest (${latestVersion}). Please update the version in openapitools.json to "${latestVersion}".`,
      )
    }
  } catch (err) {
    console.warn('Failed to check OpenAPI Generator CLI version:', err)
  }
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
import {
  ${factories.join(',\n  ')}
} from './api'
import { Configuration, ConfigurationParameters } from './configuration'
import type { AxiosInstance } from 'axios'

type ClientConfig = {
  basePath: string
  configurationParameters?: ConfigurationParameters
  axios?: AxiosInstance
}

export type ${clientName}Client = ReturnType<typeof create${clientName}Client>

export const create${clientName}Client = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig) => {
  const configuration = new Configuration(configurationParameters)
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

  const prettierConfigPath = path.join(appRootDir, '.prettierrc.js')
  const prettierIgnorePath = path.join(appRootDir, '.prettierignore')
  execSync(
    `prettier --write ${outputDir} --config ${prettierConfigPath} --ignore-path ${prettierIgnorePath}`,
    { stdio: 'inherit' },
  )
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

const generateLocalApiSpec = (type: ValidType): string => {
  const folderName = localFolders[type]
  if (!folderName) {
    throw new Error(`Local API generation is not supported for type '${type}'`)
  }

  console.log('Generating local API spec...')

  const tempDir = path.join(appRootDir, '.temp-specs')
  mkdirSync(tempDir, { recursive: true })

  const tempFileName = `api-spec-${randomUUID()}.json`
  const tempFilePath = path.join(tempDir, tempFileName)

  const env = { ...process.env, API_SPEC_OUTPUT_PATH: tempFilePath }

  const backendDir = path.join(appRootDir, '..', folderName)
  execSync('npm run generate-api-spec', {
    cwd: backendDir,
    stdio: 'inherit',
    env,
  })

  return tempFilePath
}

const cleanupTempFile = (filePath: string) => {
  try {
    unlinkSync(filePath)
    console.log('Cleaned up temporary API spec file')
  } catch (error) {
    console.warn('Failed to cleanup temporary file:', error)
  }
}

const getSpecPath = (type: ValidType, options: GenerateClientOptions) => {
  if (options.useLocal) {
    return generateLocalApiSpec(type)
  }
  return endpoints[type]
}

export const generateClient = async (type: ValidType, options: GenerateClientOptions = {}) => {
  await checkOpenApiGeneratorVersion()
  const outputDir = path.join(options.rootDir ?? appRootDir, type)

  const specPath = getSpecPath(type, options)
  try {
    cleanupExistingClient(type, outputDir)
    generateOpenApiClient(type, specPath, outputDir)
    generateClientFile(type, outputDir)
    updateIndexFile(type, outputDir)
    customizeSlovenskoSkGeneratedCode(type, outputDir)
    formatGeneratedCode(type, outputDir)

    console.log(`Client generation for ${type} completed successfully.`)
  } catch (error) {
    console.error(`Error generating client for ${type}:`, error)
    throw error
  } finally {
    if (options.useLocal) {
      cleanupTempFile(specPath)
    }
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
      .option('--local', 'Generate from local API spec')
      .action((type: string, options) => {
        if (!isValidType(type)) {
          console.error(`Invalid type: ${type}. Valid types are: ${validTypes.join(', ')}.`)
          process.exit(1)
        }

        generateClient(type, {
          useLocal: options.local,
        }).catch(() => process.exit(1))
      })

    program.parse()
  })
}
