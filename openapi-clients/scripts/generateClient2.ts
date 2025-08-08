import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { rimrafSync } from 'rimraf'
import camelcase from 'camelcase'
import { get as getAppRootDir } from 'app-root-dir'

export const validTypes = [
  'forms',
  'tax',
  'city-account',
  'slovensko-sk',
  'clamav-scanner',
  // 'magproxy',
] as const
export type ValidType = (typeof validTypes)[number]

const appRootDir = getAppRootDir()

console.log(process.env)
const isCiEnv = Boolean(process.env.GIT_COMMIT)
const gitCommitSha = process.env.GIT_COMMIT

export const paths: Record<ValidType, string> = {
  forms: path.join(appRootDir, '..', 'nest-forms-backend', 'api-spec.json'),
  tax: path.join(appRootDir, '..', 'nest-tax-backend', 'api-spec.json'),
  'city-account': path.join(appRootDir, '..', 'nest-city-account', 'api-spec.json'),
  'clamav-scanner': path.join(appRootDir, '..', 'nest-clamav-scanner', 'api-spec.json'),
  'slovensko-sk': 'https://fix.slovensko-sk-api.bratislava.sk/openapi.yaml',
  // magproxy: 'https://new-magproxy.staging.bratislava.sk/api-json',
}

export const pathsCi: Record<ValidType, string> = {
  forms: `https://raw.githubusercontent.com/bratislava/konto.bratislava.sk/${gitCommitSha}/nest-forms-backend/api-spec.json`,
  tax: `https://raw.githubusercontent.com/bratislava/konto.bratislava.sk/${gitCommitSha}/nest-tax-backend/api-spec.json`,
  'city-account': `https://raw.githubusercontent.com/bratislava/konto.bratislava.sk/${gitCommitSha}/nest-city-account/api-spec.json`,
  'clamav-scanner': `https://raw.githubusercontent.com/bratislava/konto.bratislava.sk/${gitCommitSha}/nest-clamav-scanner/api-spec.json`,
  'slovensko-sk': 'https://fix.slovensko-sk-api.bratislava.sk/openapi.yaml',
  // magproxy: 'https://new-magproxy.staging.bratislava.sk/api-json',
}

const isUrl = (input: string): boolean => /^https?:\/\//i.test(input)

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

const cleanupExistingClient = (type: ValidType, outputDir: string) => {
  console.log(`Removing existing client for ${type}...`)
  rimrafSync(outputDir)
}

const generateOpenApiClient = (type: ValidType, input: string, outputDir: string) => {
  const sourceType = isUrl(input) ? 'URL' : 'file'
  console.log(`Generating OpenAPI client for ${type} from ${sourceType}: ${input}`)
  execSync(
    `npx @openapitools/openapi-generator-cli generate \
      -i ${input} \
      -g typescript-axios \
      -o ${outputDir} \
      --skip-validate-spec`,
    { stdio: 'inherit' },
  )
}

const getSpecPath = (type: ValidType): string => {
  if (isCiEnv) {
    if (!gitCommitSha) {
      throw new Error('GIT_COMMIT_SHA is required in CI mode but was not provided')
    }
    return pathsCi[type]
  }
  return paths[type]
}

export const generateClient = async (type: ValidType) => {
  const outputDir = path.join(appRootDir, 'predist', type)

  const specPath = getSpecPath(type)
  try {
    cleanupExistingClient(type, outputDir)
    generateOpenApiClient(type, specPath, outputDir)
    generateClientFile(type, outputDir)
    updateIndexFile(type, outputDir)
    customizeSlovenskoSkGeneratedCode(type, outputDir)

    console.log(`Client generation for ${type} completed successfully.`)
  } catch (error) {
    console.error(`Error generating client for ${type}:`, error)
    throw error
  }
}

const cleanupDirectories = () => {
  console.log('Cleaning up directories...')
  const predistDir = path.join(appRootDir, 'predist')
  const distDir = path.join(appRootDir, 'dist')

  rimrafSync(predistDir)
  rimrafSync(distDir)
  console.log('Cleaned up predist and dist directories')
}

const buildClients = () => {
  console.log('\nBuilding TypeScript clients...')
  execSync('tsc --project tsconfig.build.json', {
    cwd: appRootDir,
    stdio: 'inherit',
  })
  console.log('TypeScript build completed')
}

const generateAllClients = async () => {
  console.log('Generating all OpenAPI clients...')

  // Clean up directories first
  cleanupDirectories()

  for (const type of validTypes) {
    try {
      console.log(`\n--- Starting generation for ${type} ---`)
      await generateClient(type)
    } catch (error) {
      console.error(`Failed to generate client for ${type}:`, error)
      process.exit(1)
    }
  }

  // Build all clients
  buildClients()

  console.log('\n✅ All clients generated and built successfully!')
}

if (require.main === module) {
  generateAllClients().catch(() => process.exit(1))
}
