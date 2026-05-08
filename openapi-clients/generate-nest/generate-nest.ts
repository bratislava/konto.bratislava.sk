import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { get as getAppRootDir } from 'app-root-dir'
import { Command } from 'commander'
import type { OpenAPIObject } from '@nestjs/swagger'

const appRootDir = getAppRootDir()

const projects = {
  'forms-backend': {
    specOutputPath: path.join(appRootDir, 'forms-backend.json'),
  },
} as const

type ProjectName = keyof typeof projects

type NestApplicationLike = {
  close: () => Promise<void> | void
}

type GenerateOpenApiClientsCliOptions<TApp extends NestApplicationLike> = {
  createApp: () => Promise<TApp>
  createSwaggerDocument: (app: TApp) => OpenAPIObject
  project: ProjectName
}

const generateProjectSpec = async <TApp extends NestApplicationLike>({
  createApp,
  createSwaggerDocument,
  project,
}: GenerateOpenApiClientsCliOptions<TApp>) => {
  const app = await createApp()

  try {
    const document = createSwaggerDocument(app)
    const outputPath = projects[project].specOutputPath

    writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8')
    console.log(`API specification generated at: ${outputPath}`)
  } finally {
    await app.close()
  }
}

export const generateOpenApiClientsCli = (
  options: GenerateOpenApiClientsCliOptions<NestApplicationLike>,
) => {
  const program = new Command()

  program.name('openapi-clients').description('Generate OpenAPI client artifacts for Nest backends')

  program
    .command('generate')
    .description('Generate the OpenAPI specification file for the configured project')
    .action(() => generateProjectSpec(options).catch(() => process.exit(1)))

  const argv = process.argv.length > 2 ? process.argv : [...process.argv, 'generate']

  program.parse(argv)
}
