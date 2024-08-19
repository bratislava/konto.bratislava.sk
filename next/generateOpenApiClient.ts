const { execSync } = require('node:child_process')
const { readFile, writeFile } = require('node:fs').promises
const { rimrafSync } = require('rimraf')

/*
 * This script generates OpenAPI clients for the specified type.
 *
 * In addition to using @openapitools/openapi-generator-cli it does these things:
 * 1. Uses Docker to run the OpenAPI generator CLI to generate the client, it produces consistent results and works
 *   on all platforms (the official CLI breaks when the schema generator needs update). This one uses the latest release
 *   automatically.
 * 2. Removes the existing client directory before generating a new one.
 * 3. Replaces all `options?: any` with `options?: RawAxiosRequestConfig` in the generated client. This is needed until
 *   https://github.com/OpenAPITools/openapi-generator/issues/15985 is fixed.
 * 4. Formats the generated client with Prettier.
 */

async function replaceOptionsType(filePath: string) {
  try {
    const data = await readFile(filePath, 'utf-8')
    const result = data.replaceAll('options?: any', 'options?: RawAxiosRequestConfig')
    await writeFile(filePath, result, 'utf-8')
  } catch (error) {
    console.error(error)
  }
}

const validTypes = ['forms', 'tax', 'city-account']

// To generate client from locally running backend, use 'http://host.docker.internal:3000/api-json'
const endpoints = {
  forms: 'https://nest-forms-backend.staging.bratislava.sk/api-json',
  tax: 'https://nest-tax-backend.staging.bratislava.sk/api-json',
  'city-account': 'https://nest-city-account.staging.bratislava.sk/api-json',
}

const outputDirs = {
  forms: './clients/openapi-forms',
  tax: './clients/openapi-tax',
  'city-account': './clients/openapi-city-account',
}

const generateClient = async (type: string) => {
  if (!validTypes.includes(type)) {
    console.error(`Invalid type: ${type}. Valid types are: ${validTypes.join(',')}.`)
    process.exit(1)
  }

  const url = endpoints[type]
  const outputDir = outputDirs[type]
  const currentDir = process.cwd()

  const dockerPullCommand = `docker pull openapitools/openapi-generator-cli:latest-release`
  const dockerCommand = `docker run --rm -v "${currentDir}:/local" openapitools/openapi-generator-cli:latest-release generate -i ${url} -g typescript-axios -o /local/${outputDir} --skip-validate-spec`
  const prettierCommand = `prettier --write ${outputDir}`

  try {
    console.log(`Removing existing client for ${type}...`)
    rimrafSync(outputDir)
    console.log(`Pulling the latest OpenAPI generator Docker image...`)
    execSync(`cross-env ${dockerPullCommand}`, { stdio: 'inherit' })
    console.log(`Generating client for ${type}...`)
    execSync(`cross-env ${dockerCommand}`, { stdio: 'inherit' })
    console.log(`Replacing options type in generated client...`)
    await replaceOptionsType(`${outputDir}/api.ts`)
    console.log(`Formatting ${type} client with Prettier...`)
    execSync(`cross-env ${prettierCommand}`, { stdio: 'inherit' })
    console.log(`Client generation for ${type} completed successfully.`)
  } catch (error) {
    console.error(`Error generating client for ${type}:`, error)
  }
}

const args = process.argv.slice(2)
if (args.length !== 1) {
  console.error('Usage: ts-node generateOpenApiClient.ts <type>')
  console.error(`Valid types: ${validTypes.join(', ')}`)
  process.exit(1)
}

const type = args[0]
generateClient(type)
