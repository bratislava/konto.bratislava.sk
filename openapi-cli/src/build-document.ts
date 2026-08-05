import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { OpenAPIObject } from '@nestjs/swagger'

import { CliError } from './cli-error'
import { compileBackend } from './compile'
import { asOpenApiContract } from './contract'
import { installRequireHook, normalizePath } from './require-hook'
import { readSwaggerPluginOptions } from './swagger-plugin'
import { loadBackendToolchain } from './toolchain'
import type { BackendConfig } from './types'

/**
 * Compiles the backend, loads its contract and produces the document — the same one the
 * running server serves at `/api-json`, because it comes from the same factory.
 *
 * The app is created in preview mode, so no provider is instantiated and nothing connects to
 * a database or broker. That is only possible because the contract takes the port as an
 * argument instead of resolving it from a config provider.
 */
export async function buildDocument(
  backend: BackendConfig,
  backendDir: string,
): Promise<OpenAPIObject> {
  const entryPath = join(backendDir, backend.entry)
  const configPath = join(backendDir, backend.tsconfig)

  // Checked before the multi-second compile, so an unwired backend fails immediately.
  if (!existsSync(entryPath)) {
    throw new CliError(
      `${entryPath} not found — a backend must export { AppModule, createSwaggerDocument } from there`,
    )
  }

  const swaggerOptions = readSwaggerPluginOptions(backendDir)
  const toolchain = loadBackendToolchain(backendDir)
  const sources = new Map<string, string>()

  try {
    compileBackend({
      typescript: toolchain.typescript,
      swaggerBefore: toolchain.swaggerBefore,
      swaggerOptions,
      backendDir,
      tsconfig: backend.tsconfig,
      sources,
    })

    const hook = installRequireHook({ sources, configPath })
    try {
      if (!sources.has(normalizePath(entryPath))) {
        throw new CliError(
          `${entryPath} is not in the file list of ${configPath} — check its "include"`,
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports -- served from memory
      // by the hook installed above.
      const contract = asOpenApiContract(require(entryPath), entryPath)

      const app = await toolchain.nestFactory.create(contract.AppModule, {
        preview: true,
        logger: false,
      })
      try {
        await contract.prepareApp?.(app)
        return contract.createSwaggerDocument(app, backend.port)
      } finally {
        // Without this the process keeps an open handle and never exits.
        await app.close()
      }
    } finally {
      hook.dispose()
    }
  } finally {
    toolchain.dispose()
  }
}
