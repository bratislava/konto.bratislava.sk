import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { rimrafSync } from 'rimraf'
import { ValidType, validTypes, endpoints } from './types'

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

const customizeSlovenskoSkGeneratedCode = (outputDir: string) => {
  const apiPath = path.join(outputDir, 'api.ts')
  let content = readFileSync(apiPath, 'utf8')
  content = `type Base64 = string\ntype Uuid = string\n\n${content}`
  writeFileSync(apiPath, content)
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
      { stdio: 'inherit' }
    )

    if (type === 'slovensko-sk') {
      console.log(`Customizing generated code for ${type}...`)
      customizeSlovenskoSkGeneratedCode(outputDir)
    }

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
