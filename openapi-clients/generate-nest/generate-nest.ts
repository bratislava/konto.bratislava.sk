import { writeFileSync } from 'node:fs'
import path from 'node:path'

import type { OpenAPIObject } from '@nestjs/swagger'

const packageRootDir = path.resolve(__dirname, '..', '..')

const projects = {
  'forms-backend': {
    specOutputPath: path.join(packageRootDir, 'forms-backend.json'),
  },
} as const

type ProjectName = keyof typeof projects

export type NestApplicationLike = {
  close: () => Promise<void> | void
}

export type GenerateOpenApiClientsConfig<TApp extends NestApplicationLike> = {
  createApp: () => Promise<TApp>
  createSwaggerDocument: (app: TApp) => OpenAPIObject
  project: ProjectName
}

const internalRunModeEnvKey = 'OPENAPI_CLIENTS_INTERNAL_RUN'
const internalRunModeGenerate = 'generate-spec'
const pendingRunPromiseKey = '__openapiClientsPendingRunPromise'

type GlobalWithPendingRun = typeof globalThis & {
  [pendingRunPromiseKey]?: Promise<void>
}

export const isOpenApiClientsInternalRunEnabled = () =>
  process.env[internalRunModeEnvKey] === internalRunModeGenerate

const setPendingRunPromise = (promise: Promise<void>) => {
  ;(globalThis as GlobalWithPendingRun)[pendingRunPromiseKey] = promise
}

export const getPendingRunPromise = () =>
  (globalThis as GlobalWithPendingRun)[pendingRunPromiseKey]

export const defineNestOpenApiProject = <TApp extends NestApplicationLike>(
  config: GenerateOpenApiClientsConfig<TApp>,
) => {
  if (isOpenApiClientsInternalRunEnabled()) {
    setPendingRunPromise(generateProjectSpec(config))
  }

  return config
}

export const getProjectSpecOutputPath = (project: ProjectName) =>
  projects[project].specOutputPath

export const generateProjectSpec = async <TApp extends NestApplicationLike>({
  createApp,
  createSwaggerDocument,
  project,
}: GenerateOpenApiClientsConfig<TApp>) => {
  const app = await createApp()

  try {
    const document = createSwaggerDocument(app)
    const outputPath =
      process.env.OPENAPI_CLIENTS_SPEC_OUTPUT_PATH ??
      getProjectSpecOutputPath(project)

    writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8')
    console.log(`API specification generated at: ${outputPath}`)
  } finally {
    await app.close()
  }
}
