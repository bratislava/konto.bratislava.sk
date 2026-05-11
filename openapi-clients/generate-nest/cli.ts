import { spawnSync } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { Command } from 'commander'

const packageRootDir = path.resolve(__dirname, '..', '..')

const tempTsConfigFileName = '.openapi-clients.generate-spec.tsconfig.json'

const createTempTsConfig = (backendDir: string) => {
  const tempTsConfigPath = path.join(backendDir, tempTsConfigFileName)

  writeFileSync(
    tempTsConfigPath,
    JSON.stringify(
      {
        extends: './tsconfig.json',
        compilerOptions: {
          plugins: [
            {
              transform: '@nestjs/swagger/plugin',
              introspectComments: true,
            },
          ],
        },
        'ts-node': {
          compiler: 'ts-patch/compiler',
          files: true,
        },
      },
      null,
      2,
    ),
    'utf8',
  )

  return tempTsConfigPath
}

const cleanupTempTsConfig = (tempTsConfigPath: string) => {
  try {
    rmSync(tempTsConfigPath, { force: true })
  } catch {
    // Ignore cleanup failures for temp config files.
  }
}

const resolveBackendLocalDependency = (backendDir: string, request: string) =>
  require.resolve(request, { paths: [backendDir] })

const generateNestSpecFromConfig = ({
  backendDir,
  configPath,
}: {
  backendDir: string
  configPath: string
}) => {
  const tempTsConfigPath = createTempTsConfig(backendDir)

  try {
    const tsNodeBinPath = resolveBackendLocalDependency(
      backendDir,
      'ts-node/dist/bin.js',
    )

    resolveBackendLocalDependency(backendDir, 'ts-patch/compiler')

    const runnerPath = path.join(
      packageRootDir,
      'dist',
      'generate-nest',
      'run-config.js',
    )

    const result = spawnSync(
      process.execPath,
      [
        tsNodeBinPath,
        '--project',
        tempTsConfigPath,
        runnerPath,
        '--config',
        configPath,
      ],
      {
        cwd: backendDir,
        env: {
          ...process.env,
          OPENAPI_CLIENTS_INTERNAL_RUN: 'generate-spec',
        },
        stdio: 'inherit',
      },
    )

    if (result.status !== 0) {
      process.exit(result.status ?? 1)
    }
  } finally {
    cleanupTempTsConfig(tempTsConfigPath)
  }
}

const program = new Command()

program.name('openapi-clients').description('Generate OpenAPI client artifacts')

program
  .command('generate-nest')
  .description('Generate a NestJS OpenAPI specification using backend-local tooling')
  .option(
    '--config <path>',
    'Path to the backend OpenAPI config file',
    './openapi-clients.config.ts',
  )
  .action((options: { config: string }) => {
    const backendDir = process.cwd()
    const configPath = path.resolve(backendDir, options.config)

    generateNestSpecFromConfig({
      backendDir,
      configPath,
    })
  })

program.parse(process.argv)
