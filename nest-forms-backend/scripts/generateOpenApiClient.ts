import { execSync } from 'node:child_process'
import fs from 'node:fs'

import { rimrafSync } from 'rimraf'

/*
 * This script generates OpenAPI clients for the specified type.
 *
 * In addition to using @openapitools/openapi-generator-cli it does these things:
 * 1. Uses Docker to run the OpenAPI generator CLI to generate the client
 * 2. Removes the existing client directory before generating a new one
 * 3. Formats the generated client with Prettier
 * 4. For slovensko-sk client, adds custom types that are missing in the generated code
 */

const validTypes = ['slovensko-sk', 'city-account']

// To generate client from locally running backend, use 'http://host.docker.internal:3000/api-json'
const endpoints = {
  'slovensko-sk': 'https://fix.slovensko-sk-api.bratislava.sk/openapi.yaml',
  'city-account': 'https://nest-city-account.staging.bratislava.sk/api-json',
}

const outputDirs = {
  'slovensko-sk': './src/utils/clients/openapi-slovensko-sk',
  'city-account': './src/utils/clients/openapi-city-account',
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
  if (!validTypes.includes(type)) {
    console.error(
      `Invalid type: ${type}. Valid types are: ${validTypes.join(', ')}.`,
    )
    process.exit(1)
  }

  const url = endpoints[type as keyof typeof endpoints]
  const outputDir = outputDirs[type as keyof typeof outputDirs]
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

    if (type === 'slovensko-sk') {
      console.log(`Customizing generated code for ${type}...`)
      customizeSlovenskoSkGeneratedCode()
    }

    console.log(`Formatting ${type} client with Prettier...`)
    execSync(`cross-env ${prettierCommand}`, { stdio: 'inherit' })
    console.log(`Client generation for ${type} completed successfully.`)
  } catch (error) {
    console.error(`Error generating client for ${type}:`, error)
  }
}

const args = process.argv.slice(2)
if (args.length !== 1) {
  console.error('Usage: ts-node generate-slovensko-sk.ts <type>')
  console.error(`Valid types: ${validTypes.join(', ')}`)
  process.exit(1)
}

const type = args[0]
generateClient(type)
