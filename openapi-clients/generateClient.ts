const { execSync } = require('node:child_process')
const fs = require('node:fs')
const { rimrafSync } = require('rimraf')

/*
 * This script generates OpenAPI clients for the specified type.
 *
 * In addition to using @openapitools/openapi-generator-cli it does these things:
 * 1. Uses Docker to run the OpenAPI generator CLI to generate the client, it produces consistent results and works
 *   on all platforms (the official CLI breaks when the schema generator needs update). This one uses the latest release
 *   automatically.
 * 2. Removes the existing client directory before generating a new one.
 * 3. Formats the generated client with Prettier.
 */

const validTypes = ['forms', 'tax', 'city-account', 'slovensko-sk', 'clamav-scanner'] as const
type ValidType = (typeof validTypes)[number]

// To generate client from locally running backend, use 'http://host.docker.internal:3000/api-json'
const endpoints: Record<ValidType, string> = {
  forms: 'https://nest-forms-backend.staging.bratislava.sk/api-json',
  tax: 'https://nest-tax-backend.staging.bratislava.sk/api-json',
  'city-account': 'https://nest-city-account.staging.bratislava.sk/api-json',
  'clamav-scanner': 'https://nest-clamav-scanner.staging.bratislava.sk/api-json',
  'slovensko-sk': 'https://fix.slovensko-sk-api.bratislava.sk/openapi.yaml',
}

const outputDirs: Record<ValidType, string> = {
  forms: './forms',
  tax: './tax',
  'city-account': './city-account',
  'clamav-scanner': './clamav-scanner',
  'slovensko-sk': './slovensko-sk',
}

/**
 * The output for slovensko-sk contains two types that are missing in the generated code, which causes the code to fail.
 * We add them manually at the top of the file.
 */
const customizeSlovenskoSkGeneratedCode = () => {
  const apiPath = `${outputDirs['slovensko-sk']}/api.ts`
  let content = fs.readFileSync(apiPath, 'utf8')

  // Add custom types at the top of the file
  content = `type Base64 = string\ntype Uuid = string\n\n${content}`

  fs.writeFileSync(apiPath, content)
}

const generateClient = async (type: string) => {
  if (!validTypes.includes(type as ValidType)) {
    console.error(`Invalid type: ${type}. Valid types are: ${validTypes.join(',')}.`)
    process.exit(1)
  }

  const validType = type as ValidType
  const url = endpoints[validType]
  const outputDir = outputDirs[validType]
  const currentDir = process.cwd()

  const dockerPullCommand = `docker pull openapitools/openapi-generator-cli:latest-release`
  const dockerCommand = `docker run --rm -v "${currentDir}:/local" openapitools/openapi-generator-cli:latest-release generate -i ${url} -g typescript-axios -o /local/${outputDir} --skip-validate-spec`

  try {
    console.log(`Removing existing client for ${type}...`)
    rimrafSync(outputDir)
    console.log(`Pulling the latest OpenAPI generator Docker image...`)
    execSync(dockerPullCommand, { stdio: 'inherit' })
    console.log(`Generating client for ${type}...`)
    execSync(dockerCommand, { stdio: 'inherit' })

    if (type === 'slovensko-sk') {
      console.log(`Customizing generated code for ${type}...`)
      customizeSlovenskoSkGeneratedCode()
    }

    console.log(`Client generation for ${type} completed successfully.`)
  } catch (error) {
    console.error(`Error generating client for ${type}:`, error)
    process.exit(1)
  }
}

const args = process.argv.slice(2)
if (args.length !== 1) {
  console.error('Usage: tsx generateClient.ts <type>')
  console.error(`Valid types: ${validTypes.join(', ')}`)
  process.exit(1)
}

const type = args[0]
generateClient(type)
